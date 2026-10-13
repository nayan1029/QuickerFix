package com.quickerfix.service;

import com.quickerfix.dto.request.AuthorityContactRequest;
import com.quickerfix.dto.response.AuthorityContactResponse;
import com.quickerfix.entity.AuthorityContact;
import com.quickerfix.exception.ResourceNotFoundException;
import com.quickerfix.repository.AuthorityContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor
public class AuthorityContactService {
    private final AuthorityContactRepository contacts;

    @Transactional(readOnly=true)
    public List<AuthorityContactResponse> find(String state, String district, String serviceType) {
        return contacts.findPublic(clean(state), clean(district), clean(serviceType)).stream().map(this::response).toList();
    }

    @Transactional(readOnly=true)
    public List<AuthorityContactResponse> findAllForAdmin() { return contacts.findAll().stream().map(this::response).toList(); }

    @Transactional
    public AuthorityContactResponse create(AuthorityContactRequest request) {
        AuthorityContact contact = new AuthorityContact(); apply(contact, request); return response(contacts.save(contact));
    }

    @Transactional
    public AuthorityContactResponse update(Long id, AuthorityContactRequest request) {
        AuthorityContact contact = contacts.findById(id).orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        apply(contact, request); return response(contacts.save(contact));
    }

    @Transactional
    public void withdraw(Long id) {
        AuthorityContact contact = contacts.findById(id).orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        contact.setActive(false); contacts.save(contact);
    }

    private void apply(AuthorityContact c, AuthorityContactRequest r) {
        c.setAuthorityName(r.getAuthorityName().trim()); c.setServiceType(r.getServiceType().trim().toUpperCase());
        c.setPhone(clean(r.getPhone())); c.setAlternatePhone(clean(r.getAlternatePhone())); c.setEmail(clean(r.getEmail()));
        c.setAddress(clean(r.getAddress())); c.setState(r.getState().trim()); c.setDistrict(clean(r.getDistrict()));
        c.setCoverage(r.getCoverage().trim().toUpperCase()); c.setInstructions(clean(r.getInstructions()));
        c.setOfficialSourceUrl(clean(r.getOfficialSourceUrl())); c.setVerifiedAt(r.getVerifiedAt());
        c.setEmergency(r.isEmergency()); c.setActive(r.isActive());
    }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private AuthorityContactResponse response(AuthorityContact c) {
        return new AuthorityContactResponse(c.getId(),c.getAuthorityName(),c.getServiceType(),c.getPhone(),c.getAlternatePhone(),
                c.getEmail(),c.getAddress(),c.getState(),c.getDistrict(),c.getCoverage(),c.getInstructions(),
                c.getOfficialSourceUrl(),c.getVerifiedAt(),c.isEmergency(),c.isActive());
    }
}
