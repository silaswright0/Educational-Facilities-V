package com.efl.facilities.models;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class FacilityTest {

    @Test
    void gettersAndSettersWorkAsExpected() {
        Facility f = new Facility();

        f.setId(99L);
        f.setUniqueId("SCH-999");
        f.setFacilityName("Test Academy");
        f.setFacilityType("Secondary School");
        f.setAddress("456 Sample Ave");
        f.setProvince("ON");
        f.setMunicipalityName("Waterloo");
        f.setPostalCode("N2L 3G1");
        f.setFrenchImmersion(false);
        f.setCensusDivisionId("3523");
        f.setGeometry("POINT(-80.5 43.5)");
        f.setLongitude(new BigDecimal("-80.5000"));
        f.setLatitude(new BigDecimal("43.5000"));
        LocalDate updated = LocalDate.of(2025, 2, 1);
        f.setDateUpdated(updated);

        f.setAuthorityName("Waterloo DSB");
        f.setUnit("Unit A");
        f.setSourceId("SRC-123");
        f.setMinGrade("JK");
        f.setMaxGrade("12");
        f.setLanguageMinorityStatus(Boolean.TRUE);
        f.setEarlyImmersion(Boolean.FALSE);
        f.setMiddleImmersion(Boolean.TRUE);
        f.setLateImmersion(Boolean.FALSE);
        f.setCensusDivisionName("Waterloo Region");

        assertEquals(99L, f.getId());
        assertEquals("SCH-999", f.getUniqueId());
        assertEquals("Test Academy", f.getFacilityName());
        assertEquals("Secondary School", f.getFacilityType());
        assertEquals("456 Sample Ave", f.getAddress());
        assertEquals("ON", f.getProvince());
        assertEquals("Waterloo", f.getMunicipalityName());
        assertEquals("N2L 3G1", f.getPostalCode());
        assertFalse(f.getFrenchImmersion());
        assertEquals("3523", f.getCensusDivisionId());
        assertEquals("POINT(-80.5 43.5)", f.getGeometry());
        assertEquals(new BigDecimal("-80.5000"), f.getLongitude());
        assertEquals(new BigDecimal("43.5000"), f.getLatitude());
        assertEquals(updated, f.getDateUpdated());

        assertEquals("Waterloo DSB", f.getAuthorityName());
        assertEquals("Unit A", f.getUnit());
        assertEquals("SRC-123", f.getSourceId());
        assertEquals("JK", f.getMinGrade());
        assertEquals("12", f.getMaxGrade());
        assertEquals(Boolean.TRUE, f.getLanguageMinorityStatus());
        assertEquals(Boolean.FALSE, f.getEarlyImmersion());
        assertEquals(Boolean.TRUE, f.getMiddleImmersion());
        assertEquals(Boolean.FALSE, f.getLateImmersion());
        assertEquals("Waterloo Region", f.getCensusDivisionName());
    }
}
