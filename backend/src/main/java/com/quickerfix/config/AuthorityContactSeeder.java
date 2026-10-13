package com.quickerfix.config;

import com.quickerfix.entity.AuthorityContact;
import com.quickerfix.repository.AuthorityContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

/** Seeds a small, source-attributed starter directory; administrators maintain local records. */
@Component @RequiredArgsConstructor
public class AuthorityContactSeeder implements CommandLineRunner {
    private final AuthorityContactRepository contacts;
    @Override public void run(String... args) {
        seed("Emergency Response Support System", "GENERAL EMERGENCY", "112", null, "NATIONAL", true,
                "For urgent police, fire, rescue or medical assistance across India.", "https://112.gov.in/", "India");
        seed("Jharkhand Police Emergency Helpline", "POLICE", "100", null, "STATE", true,
                "Jharkhand State Portal lists 100 for police. 112 is the pan-India integrated emergency number.", "https://www.jharkhand.gov.in/", "Jharkhand");
        seed("Jharkhand Fire Service", "FIRE", "102", null, "STATE", true,
                "Jharkhand State Portal lists 102 for fire services. 112 is also the integrated emergency number.", "https://www.jharkhand.gov.in/", "Jharkhand");
        seed("Jharkhand Ambulance Service", "MEDICAL", "108", null, "STATE", true,
                "Jharkhand State Portal lists 108 for ambulance service. For urgent multi-service emergencies call 112.", "https://www.jharkhand.gov.in/", "Jharkhand");
        seed("Jharkhand Blood Bank Helpline", "MEDICAL", "1910", null, "STATE", false,
                "Jharkhand State Portal lists this number for blood bank information.", "https://www.jharkhand.gov.in/", "Jharkhand");
        seed("Women Helpline", "WOMEN SAFETY", "181", null, "NATIONAL", true,
                "Government women helpline; connects with emergency response and support services.", "https://wcd.gov.in/women/help", "India");
        seed("Child Helpline", "CHILD SAFETY", "1098", null, "NATIONAL", true,
                "Government child helpline. For immediate danger, call 112.", "https://wcd.gov.in/", "India");
        seed("Jharkhand Police DG Control Room", "POLICE", "7542029602", "0651-2446607", "STATE", true,
                "State police control room. For urgent emergencies, call 112.", "https://jhpolice.gov.in/contact-us", "Jharkhand");
        seed("Jharkhand Home, Jail and Disaster Management Department", "DISASTER MANAGEMENT", "0651-2400218", "0651-2446923", "STATE", false,
                "Department office contact; for immediate emergency response call 112.", "https://jharkhand.gov.in/home", "Jharkhand");
    }
    private void seed(String name,String type,String phone,String alternate,String coverage,boolean emergency,String instructions,String source,String state) {
        if (contacts.existsByAuthorityNameAndPhone(name,phone)) return;
        AuthorityContact c=new AuthorityContact(); c.setAuthorityName(name); c.setServiceType(type); c.setPhone(phone); c.setAlternatePhone(alternate);
        c.setCoverage(coverage); c.setEmergency(emergency); c.setInstructions(instructions); c.setOfficialSourceUrl(source);
        c.setVerifiedAt(LocalDate.of(2026,10,14)); c.setState(state); c.setActive(true); contacts.save(c);
    }
}
