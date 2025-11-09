package com.efl.facilities.repositories;

import com.efl.facilities.models.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    // Find by uniqueId
    Facility findByUniqueId(String uniqueId);

    // Find all facilities by province
    List<Facility> findByProvince(String province);

    // Find all facilities by municipality
    List<Facility> findByMunicipalityName(String municipalityName);

    // Find all facilities by facility type
    List<Facility> findByFacilityType(String facilityType);

    // Find all facilities with French Immersion
    List<Facility> findByFrenchImmersionTrue();
}