package com.quickerfix.repository;

import com.quickerfix.entity.DuplicateLink;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DuplicateLinkRepository extends JpaRepository<DuplicateLink, Long> { }
