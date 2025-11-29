package com.efl.facilities;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MunicipalitiesController {

    private final MunicipalitiesService municipalitiesService;

    public MunicipalitiesController(MunicipalitiesService municipalitiesService) {
        this.municipalitiesService = municipalitiesService;
    }

    @CrossOrigin(origins = "*")
    @GetMapping(value = "/api/municipalities", produces = "application/json")
    public String getMunicipalities() throws Exception {
        return municipalitiesService.getMunicipalitiesGeoJson();
    }
}