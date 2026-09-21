package com.quickerfix.repository;
import com.quickerfix.entity.OtpRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface OtpRecordRepository extends JpaRepository<OtpRecord, Long> {
 Optional<OtpRecord> findTopBySubjectHashOrderByCreatedAtDesc(String subjectHash);
}
