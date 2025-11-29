package com.efl.facilities.controllers;

import com.efl.facilities.models.Facility;
import com.efl.facilities.services.FacilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class FacilityControllerTest {

    private static final String BASE = "/api/facilities";
    private static final String TYPE_ELEMENTARY = "Elementary School";
    private static final String TYPE_SECONDARY = "Secondary School";
    private static final String CITY_GUELPH = "Guelph";
    private static final String CITY_OTTAWA = "Ottawa";
    private static final String PROVINCE_ON = "ON";
    private static final String UID_001 = "SCH-001";
    private static final String UID_002 = "SCH-002";
    private static final String UID_010 = "SCH-010";
    private static final String UID_011 = "SCH-011";
    private static final String UID_030 = "SCH-030";
    private static final String UID_040 = "SCH-040";

    private MockMvc mockMvc;

    @Mock private FacilityService facilityService;
    @InjectMocks private FacilityController facilityController;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(facilityController).build();
    }

    private Facility sampleFacility(long id, String uniqueId, String name, String type, String municipality) {
        Facility f = new Facility();
        f.setId(id);
        f.setUniqueId(uniqueId);
        f.setFacilityName(name);
        f.setFacilityType(type);
        f.setMunicipalityName(municipality);
        f.setProvince(PROVINCE_ON);
        f.setAddress("123 Example St");
        f.setPostalCode("A1A 1A1");
        f.setFrenchImmersion(true);
        f.setCensusSubdivisionId("3506");
        f.setGeometry("POINT(-79.3832 43.6532)");
        f.setLongitude(new BigDecimal("-79.3832"));
        f.setLatitude(new BigDecimal("43.6532"));
        f.setDateUpdated(LocalDate.of(2025, 1, 15));
        return f;
    }

    @Test
    @DisplayName("GET municipality -> list")
    void getFacilitiesByMunicipalityReturnsList() throws Exception {
        List<Facility> data = List.of(
                sampleFacility(1L, UID_001, "Central PS", TYPE_ELEMENTARY, CITY_GUELPH),
                sampleFacility(2L, UID_002, "Northview SS", TYPE_SECONDARY, CITY_GUELPH)
        );
        when(facilityService.getFacilitiesByMunicipality(CITY_GUELPH)).thenReturn(data);

        var result = mockMvc.perform(get(BASE + "/municipality/{municipalityName}", CITY_GUELPH))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].uniqueId", is(UID_001)))
                .andExpect(jsonPath("$[1].facilityType", is(TYPE_SECONDARY)))
                .andReturn();

        assertEquals(200, result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().length() > 0);

        ArgumentCaptor<String> cap = ArgumentCaptor.forClass(String.class);
        verify(facilityService).getFacilitiesByMunicipality(cap.capture());
        verifyNoMoreInteractions(facilityService);
    }

    @Test
    @DisplayName("GET type -> list")
    void getFacilitiesByTypeReturnsList() throws Exception {
        List<Facility> data = List.of(sampleFacility(3L, UID_010, "Maple ES", TYPE_ELEMENTARY, CITY_OTTAWA));
        when(facilityService.getFacilitiesByType(TYPE_ELEMENTARY)).thenReturn(data);

        var result = mockMvc.perform(get(BASE + "/type/{facilityType}", TYPE_ELEMENTARY))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].facilityType", is(TYPE_ELEMENTARY)))
                .andExpect(jsonPath("$[0].municipalityName", is(CITY_OTTAWA)))
                .andExpect(jsonPath("$[0].frenchImmersion", is(true)))
                .andReturn();

        assertEquals(200, result.getResponse().getStatus());
        verify(facilityService).getFacilitiesByType(TYPE_ELEMENTARY);
        verifyNoMoreInteractions(facilityService);
    }

    @Test
    @DisplayName("GET french-immersion -> list")
    void getFrenchImmersionFacilitiesReturnsList() throws Exception {
        List<Facility> data = List.of(
                sampleFacility(4L, "SCH-100", "École Centrale", TYPE_ELEMENTARY, "Sudbury"),
                sampleFacility(5L, "SCH-101", "École Ouest", TYPE_SECONDARY, "Sudbury")
        );
        when(facilityService.getFrenchImmersionFacilities()).thenReturn(data);

        var result = mockMvc.perform(get(BASE + "/french-immersion"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].frenchImmersion", is(true)))
                .andExpect(jsonPath("$[1].frenchImmersion", is(true)))
                .andReturn();

        assertEquals(200, result.getResponse().getStatus());
        verify(facilityService).getFrenchImmersionFacilities();
        verifyNoMoreInteractions(facilityService);
    }

    @Test
    @DisplayName("GET all -> list")
    void getAllFacilitiesReturnsList() throws Exception {
        List<Facility> data = List.of(
                sampleFacility(10L, UID_010, "Alpha", TYPE_ELEMENTARY, CITY_OTTAWA),
                sampleFacility(11L, UID_011, "Beta", TYPE_SECONDARY, "Toronto")
        );
        when(facilityService.getAllFacilities()).thenReturn(data);

        var result = mockMvc.perform(get(BASE))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].uniqueId", is(UID_010)))
                .andExpect(jsonPath("$[1].uniqueId", is(UID_011)))
                .andReturn();

        assertEquals(200, result.getResponse().getStatus());
        verify(facilityService).getAllFacilities();
        verifyNoMoreInteractions(facilityService);
    }

    @Test
    @DisplayName("GET province -> list")
    void getFacilitiesByProvinceReturnsList() throws Exception {
        List<Facility> data = List.of(sampleFacility(20L, "SCH-020", "Gamma", TYPE_ELEMENTARY, "Kingston"));
        when(facilityService.getFacilitiesByProvince(PROVINCE_ON)).thenReturn(data);

        var result = mockMvc.perform(get(BASE + "/province/{province}", PROVINCE_ON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].province", is(PROVINCE_ON)))
                .andReturn();

        assertEquals(200, result.getResponse().getStatus());
        verify(facilityService).getFacilitiesByProvince(PROVINCE_ON);
        verifyNoMoreInteractions(facilityService);
    }

    @Test
    @DisplayName("GET by id -> single")
    void getFacilityByIdReturnsOne() throws Exception {
        Facility item = sampleFacility(30L, UID_030, "Delta", TYPE_ELEMENTARY, "Waterloo");
        when(facilityService.getFacilityById(30L)).thenReturn(Optional.of(item));

        var result = mockMvc.perform(get(BASE + "/{id}", 30L))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.uniqueId", is(UID_030)))
                .andExpect(jsonPath("$.facilityName", is("Delta")))
                .andReturn();

        assertEquals(200, result.getResponse().getStatus());
        verify(facilityService).getFacilityById(30L);
        verifyNoMoreInteractions(facilityService);
    }

    @Test
    @DisplayName("GET by uniqueId -> single")
    void getFacilityByUniqueIdReturnsOne() throws Exception {
        Facility item = sampleFacility(40L, UID_040, "Epsilon", TYPE_SECONDARY, CITY_GUELPH);
        when(facilityService.getFacilityByUniqueId(UID_040)).thenReturn(item);

        var result = mockMvc.perform(get(BASE + "/unique/{uniqueId}", UID_040))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.uniqueId", is(UID_040)))
                .andExpect(jsonPath("$.facilityName", is("Epsilon")))
                .andReturn();

        assertEquals(200, result.getResponse().getStatus());
        verify(facilityService).getFacilityByUniqueId(UID_040);
        verifyNoMoreInteractions(facilityService);
    }
}
