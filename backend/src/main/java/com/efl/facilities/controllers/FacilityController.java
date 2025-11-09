package com.efl.facilities.controllers;

import com.efl.facilities.models.Facility;
import com.efl.facilities.services.FacilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@CrossOrigin(origins = "*")
public class FacilityController {

    @Autowired
    private FacilityService facilityService;

    @GetMapping
    public List<Facility> getAllFacilities() {
        return facilityService.getAllFacilities();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Facility> getFacilityById(@PathVariable Long id) {
        return facilityService.getFacilityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/unique/{uniqueId}")
    public ResponseEntity<Facility> getFacilityByUniqueId(@PathVariable String uniqueId) {
        Facility facility = facilityService.getFacilityByUniqueId(uniqueId);
        return facility != null ? ResponseEntity.ok(facility) : ResponseEntity.notFound().build();
    }

    @GetMapping("/province/{province}")
    public List<Facility> getFacilitiesByProvince(@PathVariable String province) {
        return facilityService.getFacilitiesByProvince(province);
    }

    @GetMapping("/municipality/{municipalityName}")
    public List<Facility> getFacilitiesByMunicipality(@PathVariable String municipalityName) {
        return facilityService.getFacilitiesByMunicipality(municipalityName);
    }

    @GetMapping("/type/{facilityType}")
    public List<Facility> getFacilitiesByType(@PathVariable String facilityType) {
        return facilityService.getFacilitiesByType(facilityType);
    }

    @GetMapping("/french-immersion")
    public List<Facility> getFrenchImmersionFacilities() {
        return facilityService.getFrenchImmersionFacilities();
    }
}