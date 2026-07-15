@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Pitch> createPitch(
            @RequestPart("data") String dataJson,
            @RequestPart("video") MultipartFile video,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {
        PitchRequest request = objectMapper.readValue(dataJson, PitchRequest.class);

        Set<ConstraintViolation<PitchRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String message = violations.iterator().next().getMessage();
            throw new RuntimeException(message);
        }

        return ResponseEntity.ok(pitchService.createPitch(request, video, image));
    }