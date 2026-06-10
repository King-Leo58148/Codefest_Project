package com.codewithlouis.codefest_project.services;
//

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtServices {
    @Value("${security.jwt.secert-key}")
    private String secertKey;




}
