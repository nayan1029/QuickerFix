package com.quickerfix.repository;

import com.quickerfix.entity.AuthorityContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AuthorityContactRepository extends JpaRepository<AuthorityContact, Long> {
    boolean existsByAuthorityNameAndPhone(String authorityName, String phone);
    @Query("select c from AuthorityContact c where c.active = true and " +
            "(:state is null or lower(c.state) = lower(:state) or lower(c.coverage) = 'national') and " +
            "(:district is null or c.district is null or lower(c.district) = lower(:district)) and " +
            "(:serviceType is null or lower(c.serviceType) = lower(:serviceType)) " +
            "order by c.emergency desc, c.authorityName asc")
    List<AuthorityContact> findPublic(@Param("state") String state, @Param("district") String district,
                                      @Param("serviceType") String serviceType);
}
