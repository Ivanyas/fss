package com.fss.service;

import com.fss.model.FileMetadata;
import com.fss.repository.FileMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileMetadataRepository repository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public List<FileMetadata> getAllFiles() {
        return repository.findAll();
    }

    public List<FileMetadata> uploadFiles(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("No files provided");
        }

        List<FileMetadata> uploadedFiles = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            String originalFileName = file.getOriginalFilename();
            String storedFileName = UUID.randomUUID().toString() + getExtension(originalFileName);

            try {
                Path targetLocation = uploadPath.resolve(storedFileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

                FileMetadata metadata = new FileMetadata();
                metadata.setOriginalFileName(originalFileName);
                metadata.setStoredFileName(storedFileName);
                metadata.setFileSize(file.getSize());
                metadata.setMimeType(file.getContentType());

                uploadedFiles.add(repository.save(metadata));

            } catch (IOException e) {
                throw new RuntimeException("Failed to store file: " + originalFileName, e);
            }
        }

        return uploadedFiles;
    }

    public Resource downloadFile(Long id) {
        FileMetadata metadata = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + id));

        try {
            Path filePath = uploadPath.resolve(metadata.getStoredFileName()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found on disk: " + metadata.getOriginalFileName());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found: " + metadata.getOriginalFileName(), e);
        }
    }

    public FileMetadata getFileMetadata(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + id));
    }

    // TODO: добавить транзакции
    public Map<String, Object> deleteFiles(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("No file IDs provided");
        }

        List<Long> deleted = new ArrayList<>();
        Map<Long, String> errors = new HashMap<>();

        for (Long id : ids) {
            try {
                Optional<FileMetadata> optionalMetadata = repository.findById(id);
                if (optionalMetadata.isPresent()) {
                    FileMetadata metadata = optionalMetadata.get();
                    Path filePath = uploadPath.resolve(metadata.getStoredFileName());

                    Files.deleteIfExists(filePath);
                    repository.delete(metadata);
                    deleted.add(id);
                } else {
                    errors.put(id, "File not found");
                }
            } catch (Exception e) {
                errors.put(id, e.getMessage());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("deleted", deleted);
        if (!errors.isEmpty()) {
            result.put("errors", errors);
        }
        return result;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
