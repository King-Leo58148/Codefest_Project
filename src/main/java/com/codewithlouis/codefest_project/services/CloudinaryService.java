package com.codewithlouis.codefest_project.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folder) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image"
                    )
            );
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    public String uploadVideo(MultipartFile file, String folder) {
        try {
            // Upload first to check duration
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "video"
                    )
            );

            // Check duration after upload
            Double duration = (Double) uploadResult.get("duration");
            if (duration != null && duration > 60) {
                // Delete the uploaded video immediately
                String publicId = (String) uploadResult.get("public_id");
                cloudinary.uploader().destroy(publicId,
                        ObjectUtils.asMap("resource_type", "video"));
                throw new RuntimeException("Video must be 60 seconds or less");
            }

            return (String) uploadResult.get("secure_url");
        } catch (RuntimeException e) {
            throw e;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload video to Cloudinary", e);
        }
    }
}