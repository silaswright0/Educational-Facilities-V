package com.efl.facilities.repositories;

import com.efl.facilities.models.Facility;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class FacilityRepositoryTest {

    private static final String TYPE_ELEMENTARY = "Elementary School";
    private static final String TYPE_SECONDARY = "Secondary School";

    @Autowired
    private FacilityRepository facilityRepository;

    private Facility facility(
            String uniqueId,
            String name,
            String province,
            String municipality,
            String type,
            boolean frenchImmersion
    ) {
        Facility f = new Facility();
        f.setUniqueId(uniqueId);
        f.setFacilityName(name);
        f.setProvince(province);
        f.setMunicipalityName(municipality);
        f.setFacilityType(type);
        f.setFrenchImmersion(frenchImmersion);
        return f;
    }

    @Test
    @DisplayName("findByUniqueId returns a single Facility")
    void findByUniqueIdReturnsEntity() {
        Facility saved = facilityRepository.save(
                facility("SCH-100", "Central PS", "ON", "Guelph", TYPE_ELEMENTARY, true)
        );

        Facility found = facilityRepository.findByUniqueId("SCH-100");

        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(saved.getId());
        assertThat(found.getFacilityName()).isEqualTo("Central PS");
    }

    @Test
    @DisplayName("findByProvince returns all facilities within a province")
    void findByProvinceReturnsList() {
        facilityRepository.save(facility("SCH-101", "Maple ES", "ON", "Ottawa", TYPE_ELEMENTARY, false));
        facilityRepository.save(facility("SCH-102", "Lakeside SS", "ON", "Ottawa", TYPE_SECONDARY, true));
        facilityRepository.save(facility("SCH-200", "Prairie ES", "MB", "Brandon", TYPE_ELEMENTARY, false));

        List<Facility> on = facilityRepository.findByProvince("ON");
        List<Facility> mb = facilityRepository.findByProvince("MB");

        assertThat(on).hasSize(2)
                .extracting(Facility::getUniqueId)
                .containsExactlyInAnyOrder("SCH-101", "SCH-102");

        assertThat(mb).hasSize(1)
                .first()
                .extracting(Facility::getUniqueId)
                .isEqualTo("SCH-200");
    }

    @Test
    @DisplayName("findByMunicipalityName returns facilities filtered by municipality")
    void findByMunicipalityNameReturnsList() {
        facilityRepository.save(facility("SCH-300", "Northview", "ON", "Waterloo", TYPE_SECONDARY, true));
        facilityRepository.save(facility("SCH-301", "Southview", "ON", "Waterloo", TYPE_ELEMENTARY, false));
        facilityRepository.save(facility("SCH-302", "Westview", "ON", "Cambridge", TYPE_ELEMENTARY, false));

        List<Facility> waterloo = facilityRepository.findByMunicipalityName("Waterloo");
        assertThat(waterloo).hasSize(2)
                .extracting(Facility::getUniqueId)
                .containsExactlyInAnyOrder("SCH-300", "SCH-301");
    }

    @Test
    @DisplayName("findByFacilityType returns facilities filtered by type")
    void findByFacilityTypeReturnsList() {
        facilityRepository.save(facility("SCH-400", "Oakridge", "ON", "London", TYPE_ELEMENTARY, true));
        facilityRepository.save(facility("SCH-401", "Pinecrest", "ON", "London", TYPE_SECONDARY, false));

        List<Facility> elementary = facilityRepository.findByFacilityType(TYPE_ELEMENTARY);
        assertThat(elementary).hasSize(1)
                .first()
                .extracting(Facility::getUniqueId)
                .isEqualTo("SCH-400");
    }

    @Test
    @DisplayName("findByFrenchImmersionTrue returns only French Immersion facilities")
    void findByFrenchImmersionTrueReturnsList() {
        facilityRepository.save(facility("SCH-500", "École Est", "ON", "Sudbury", TYPE_ELEMENTARY, true));
        facilityRepository.save(facility("SCH-501", "Central HS", "ON", "Sudbury", TYPE_SECONDARY, false));

        List<Facility> immersion = facilityRepository.findByFrenchImmersionTrue();
        assertThat(immersion).hasSize(1)
                .first()
                .extracting(Facility::getUniqueId)
                .isEqualTo("SCH-500");
    }
}
