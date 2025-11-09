package com.efl.facilities.services;

import com.efl.facilities.models.Facility;
import com.efl.facilities.repositories.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FacilityService {
    
    @Autowired
    private FacilityRepository facilityRepository;

    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    public Optional<Facility> getFacilityById(Long id) {
        return facilityRepository.findById(id);
    }

    public Facility getFacilityByUniqueId(String uniqueId) {
        return facilityRepository.findByUniqueId(uniqueId);
    }

    public List<Facility> getFacilitiesByProvince(String province) {
        return facilityRepository.findByProvince(province);
    }

    public List<Facility> getFacilitiesByMunicipality(String municipalityName) {
        return facilityRepository.findByMunicipalityName(municipalityName);
    }

    public List<Facility> getFacilitiesByType(String facilityType) {
        return facilityRepository.findByFacilityType(facilityType);
    }

    public List<Facility> getFrenchImmersionFacilities() {
        return facilityRepository.findByFrenchImmersionTrue();
    }
}