package com.codewithlouis.codefest_project.controllers;

import com.codewithlouis.codefest_project.services.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadVideo(@RequestParam MultipartFile file) {
        String url = cloudinaryService.uploadVideo(file, "nkoso/pitch-videos");
        return ResponseEntity.ok(Map.of("videoUrl", url));
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam MultipartFile file) {
        String url = cloudinaryService.uploadImage(file, "nkoso/images");
        return ResponseEntity.ok(Map.of("imageUrl", url));
    }
}