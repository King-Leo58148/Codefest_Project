@CacheEvict(value = {"allPitches", "pendingPitches", "livePitches"}, allEntries = true)
    public Pitch createPitch(PitchRequest request, MultipartFile video, MultipartFile image) {
        // 1. Auth check
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Verification checks
        if (!owner.isGhanaCardVerified() || !owner.isMomoVerified()) {
            throw new RuntimeException("You must complete Ghana Card and MoMo verification before posting a pitch");
        }
        if (owner.getRole() != Role.OWNER && owner.getRole() != Role.BOTH) {
            throw new RuntimeException("Only business owners can post a pitch");
        }

        // 3. Video is required — upload to Cloudinary
        if (video == null || video.isEmpty()) {
            throw new RuntimeException("A 60-second pitch video is required");
        }
        String videoUrl = cloudinaryService.uploadVideo(video, "nkoso/pitch-videos");

        // 3b. Cover image is optional — upload if provided, else fall back to request value
        String imageUrl = request.getImageUrl();
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image, "nkoso/pitch-images");
        }

        // 4. Build and save pitch
        Pitch pitch = new Pitch();
        pitch.setOwner(owner);
        pitch.setBusinessName(request.getBusinessName());
        pitch.setDescription(request.getDescription());
        pitch.setShortDescription(request.getShortDescription());
        pitch.setImageUrl(imageUrl);
        pitch.setVideoUrl(videoUrl);  // ✅ always from Cloudinary, never null
        pitch.setMonthlyIncome(request.getMonthlyIncome());
        pitch.setAmountNeeded(request.getAmountNeeded());
        pitch.setAmountRaised(request.getAmountRaised() == null ? 0.0 : request.getAmountRaised());
        pitch.setMinimumInvestment(request.getMinimumInvestment());
        pitch.setPreMoneyValuation(request.getPreMoneyValuation());
        pitch.setRevenue(request.getRevenue());
        pitch.setFoundedYear(request.getFoundedYear());
        pitch.setCampaignEndDate(request.getCampaignEndDate());
        pitch.setOfferType(OfferType.valueOf(request.getOfferType()));
        pitch.setOfferValue(request.getOfferValue());
        pitch.setLocation(request.getLocation());
        pitch.setIndustry(Industry.valueOf(request.getIndustry()));
        pitch.setStatus(PitchStatus.PENDING);

        return pitchRepository.save(pitch);
    }