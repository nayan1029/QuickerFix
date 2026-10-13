package com.quickerfix.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {
    private static volatile SensitiveDataCipher cipher;

    @Autowired
    public void setCipher(SensitiveDataCipher injectedCipher) {
        cipher = injectedCipher;
    }

    @Override
    public String convertToDatabaseColumn(String value) {
        return cipher == null ? value : cipher.encrypt(value);
    }

    @Override
    public String convertToEntityAttribute(String value) {
        return cipher == null ? value : cipher.decrypt(value);
    }
}
