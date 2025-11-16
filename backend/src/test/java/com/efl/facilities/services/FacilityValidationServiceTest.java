package com.efl.facilities.services;

import com.efl.facilities.models.Facility;
import com.efl.facilities.models.validation.FacilityValidationResult;
import com.efl.facilities.repositories.FacilityRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FacilityValidationServiceTest {

    @Mock
    private FacilityRepository facilityRepository;

    @InjectMocks
    private FacilityValidationService facilityValidationService;

    @Test
    void validateFacilitiesAllValidShouldBeValid() {
        Facility f = new Facility();
        f.setId(1L);
        f.setUniqueId("ABC123");
        f.setFacilityName("Test School");
        f.setProvince("ON");
        f.setLatitude(BigDecimal.valueOf(45.0));
        f.setLongitude(BigDecimal.valueOf(-75.0));

        when(facilityRepository.findAll()).thenReturn(List.of(f));

        FacilityValidationResult result = facilityValidationService.validateFacilities();

        assertThat(result.isValid()).isTrue();
        assertThat(result.getTotalRecords()).isEqualTo(1);
        assertThat(result.getIssues()).isEmpty();
        assertThat(result.getMissingFieldCount()).isZero();
        assertThat(result.getDuplicateUniqueIdCount()).isZero();
        assertThat(result.getInvalidProvinceCount()).isZero();
        assertThat(result.getInvalidCoordinateCount()).isZero();
    }

    @Test
    void validateFacilitiesMissingFieldsDuplicatesAndInvalidDataShouldReportIssues() {
        Facility f1 = new Facility();
        f1.setId(1L);
        f1.setUniqueId("DUP123");
        f1.setFacilityName("School 1");
        f1.setProvince("ON");

        Facility f2 = new Facility();
        f2.setId(2L);
        f2.setUniqueId("DUP123"); // duplicate
        f2.setFacilityName("School 2");
        f2.setProvince("XX"); // invalid province

        Facility f3 = new Facility();
        f3.setId(3L);
        // missing uniqueId and province
        f3.setFacilityName("School 3");

        Facility f4 = new Facility();
        f4.setId(4L);
        f4.setUniqueId("COORD1");
        f4.setFacilityName("School 4");
        f4.setProvince("ON");
        f4.setLatitude(BigDecimal.valueOf(95.0)); // invalid latitude
        f4.setLongitude(BigDecimal.valueOf(-75.0));

        when(facilityRepository.findAll()).thenReturn(List.of(f1, f2, f3, f4));

        FacilityValidationResult result = facilityValidationService.validateFacilities();

        assertThat(result.isValid()).isFalse();
        assertThat(result.getTotalRecords()).isEqualTo(4);
        assertThat(result.getIssues()).isNotEmpty();
        assertThat(result.getMissingFieldCount()).isGreaterThan(0);
        assertThat(result.getDuplicateUniqueIdCount()).isGreaterThan(0);
        assertThat(result.getInvalidProvinceCount()).isGreaterThan(0);
        assertThat(result.getInvalidCoordinateCount()).isGreaterThan(0);
    }
}