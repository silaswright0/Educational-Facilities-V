package com.efl.facilities.services;

import com.efl.facilities.models.Facility;
import com.efl.facilities.repositories.FacilityRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacilityServiceTest {

    private static final String UID_011 = "SCH-011";

    @Mock private FacilityRepository facilityRepository;
    @InjectMocks private FacilityService facilityService;

    private Facility fac(long id, String uid, String name) {
        Facility f = new Facility();
        f.setId(id);
        f.setUniqueId(uid);
        f.setFacilityName(name);
        return f;
    }

    @Test
    @DisplayName("getFacilityById delegates to repository.findById")
    void getFacilityByIdDelegates() {
        Facility expected = fac(10L, "SCH-010", "Central");
        when(facilityRepository.findById(10L)).thenReturn(Optional.of(expected));

        Optional<Facility> result = facilityService.getFacilityById(10L);

        assertThat(result).isPresent().contains(expected);
        verify(facilityRepository).findById(10L);
        verifyNoMoreInteractions(facilityRepository);
    }

    @Test
    @DisplayName("getFacilityByUniqueId delegates to repository.findByUniqueId")
    void getFacilityByUniqueIdDelegates() {
        Facility expected = fac(11L, UID_011, "Maple");
        when(facilityRepository.findByUniqueId(UID_011)).thenReturn(expected);

        Facility result = facilityService.getFacilityByUniqueId(UID_011);

        assertThat(result).isEqualTo(expected);
        verify(facilityRepository).findByUniqueId(UID_011);
        verifyNoMoreInteractions(facilityRepository);
    }

    @Test
    @DisplayName("getFacilitiesByProvince delegates to repository.findByProvince")
    void getFacilitiesByProvinceDelegates() {
        List<Facility> expected = List.of(fac(1L, "SCH-001", "A"), fac(2L, "SCH-002", "B"));
        when(facilityRepository.findByProvince("ON")).thenReturn(expected);

        List<Facility> result = facilityService.getFacilitiesByProvince("ON");

        assertThat(result).isEqualTo(expected);
        verify(facilityRepository).findByProvince("ON");
        verifyNoMoreInteractions(facilityRepository);
    }

    @Test
    @DisplayName("getFacilitiesByMunicipality delegates to repository.findByMunicipalityName")
    void getFacilitiesByMunicipalityDelegates() {
        List<Facility> expected = List.of(fac(3L, "SCH-003", "C"));
        when(facilityRepository.findByMunicipalityName("Guelph")).thenReturn(expected);

        List<Facility> result = facilityService.getFacilitiesByMunicipality("Guelph");

        assertThat(result).isEqualTo(expected);
        verify(facilityRepository).findByMunicipalityName("Guelph");
        verifyNoMoreInteractions(facilityRepository);
    }

    @Test
    @DisplayName("getFacilitiesByType delegates to repository.findByFacilityType")
    void getFacilitiesByTypeDelegates() {
        List<Facility> expected = List.of(fac(4L, "SCH-004", "D"));
        when(facilityRepository.findByFacilityType("Secondary School")).thenReturn(expected);

        List<Facility> result = facilityService.getFacilitiesByType("Secondary School");

        assertThat(result).isEqualTo(expected);
        verify(facilityRepository).findByFacilityType("Secondary School");
        verifyNoMoreInteractions(facilityRepository);
    }

    @Test
    @DisplayName("getFrenchImmersionFacilities delegates to repository.findByFrenchImmersionTrue")
    void getFrenchImmersionFacilitiesDelegates() {
        List<Facility> expected = List.of(fac(5L, "SCH-005", "École Est"));
        when(facilityRepository.findByFrenchImmersionTrue()).thenReturn(expected);

        List<Facility> result = facilityService.getFrenchImmersionFacilities();

        assertThat(result).isEqualTo(expected);
        verify(facilityRepository).findByFrenchImmersionTrue();
        verifyNoMoreInteractions(facilityRepository);
    }
}
