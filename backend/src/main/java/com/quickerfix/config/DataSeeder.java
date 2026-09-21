package com.quickerfix.config;
import com.quickerfix.entity.*;
import com.quickerfix.enums.Role;
import com.quickerfix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.*;
@Component @RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
 private final DepartmentRepository departments; private final CategoryRepository categories; private final UserRepository users; private final PasswordEncoder passwords;
 public void run(String... args) { if (departments.count()>0) return;
  Department roads=department("Roads & Infrastructure","roads@quickerfix.gov"), electrical=department("Electrical & Street Lighting","electrical@quickerfix.gov"), sanitation=department("Sanitation & Waste Management","sanitation@quickerfix.gov"), water=department("Water & Sewage","water@quickerfix.gov"), parks=department("Parks & Environment","parks@quickerfix.gov");
  category("Potholes","🕳️",roads); category("Damaged Roads","🛣️",roads); category("Broken Streetlights","💡",electrical); category("Electrical Hazards","⚡",electrical); category("Garbage Accumulation","🗑️",sanitation); category("Water Leakage","🚰",water); category("Fallen Trees","🌳",parks); category("Public Infrastructure","🚧",roads);
  user("Admin User","admin@quickerfix.com","admin123",Role.ADMIN,null); user("Roads Worker","worker.roads@quickerfix.com","worker123",Role.WORKER,roads); user("Sanitation Worker","worker.sanitation@quickerfix.com","worker123",Role.WORKER,sanitation); user("Demo Citizen","citizen@quickerfix.com","citizen123",Role.CITIZEN,null);
 }
 private Department department(String name,String email){Department d=new Department();d.setName(name);d.setContactEmail(email);d.setActive(true);return departments.save(d);}
 private void category(String name,String icon,Department d){Category c=new Category();c.setName(name);c.setIcon(icon);c.setDepartment(d);c.setActive(true);categories.save(c);}
 private void user(String name,String email,String password,Role role,Department d){User u=new User();u.setName(name);u.setEmail(email);u.setPassword(passwords.encode(password));u.setRole(role);u.setDepartment(d);u.setEnabled(true);users.save(u);}
}
