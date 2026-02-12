package com.fss.controller;

import com.fss.model.FileMetadata;
import com.fss.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @GetMapping
    public List<FileMetadata> getAllFiles() {
        return fileService.getAllFiles();
    }

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public List<FileMetadata> uploadFiles(@RequestParam(value = "files", required = false) MultipartFile[] files) {
        return fileService.uploadFiles(files);
    }

    // TODO: обработка ошибок через @ControllerAdvice
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        try {
            FileMetadata metadata = fileService.getFileMetadata(id);
            Resource resource = fileService.downloadFile(id);

            String encodedFileName = URLEncoder.encode(metadata.getOriginalFileName(), StandardCharsets.UTF_8)
                    .replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            metadata.getMimeType() != null ? metadata.getMimeType() : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + metadata.getOriginalFileName() + "\"; filename*=UTF-8''" + encodedFileName)
                    .body(resource);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping
    public Map<String, Object> deleteFiles(@RequestBody List<Long> ids) {
        return fileService.deleteFiles(ids);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleBadRequest(IllegalArgumentException e) {
        return Map.of("error", e.getMessage());
    }
}
