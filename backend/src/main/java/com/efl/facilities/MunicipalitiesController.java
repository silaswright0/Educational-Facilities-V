package com.efl.facilities;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@RestController
public class MunicipalitiesController {

    private final MunicipalitiesService municipalitiesService;

    public MunicipalitiesController(MunicipalitiesService municipalitiesService) {
        this.municipalitiesService = municipalitiesService;
    }

    @CrossOrigin(origins = "*")
    @GetMapping(value = "/api/municipalities", produces = "application/json")
    public ResponseEntity<Resource> getMunicipalities() {
        Resource geoJson = municipalitiesService.getMunicipalitiesGeoJson();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(geoJson);
    }
}
