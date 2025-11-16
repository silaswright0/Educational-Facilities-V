package com.efl.facilities.services;

import com.efl.facilities.models.Facility;
import com.efl.facilities.models.validation.FacilityValidationIssue;
import com.efl.facilities.models.validation.FacilityValidationResult;
import com.efl.facilities.repositories.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
/*
 * PMD Suppression Justification:
 *
 * The validation process requires generating a new FacilityValidationIssue
 * object for every problem found in every Facility record. PMD warns against
 * “instantiating new objects inside loops” as a micro-optimization rule,
 * suggesting preallocation or object reuse.
 *
 * In this case, reusing objects would:
 *   - make the code significantly more complex,
 *   - break immutability / correctness of issue records,
 *   - reduce clarity for maintainers,
 *   - provide *no meaningful performance benefit* compared to database I/O,
 *   - introduce the risk of leaking previous state between issue reports.
 *
 * Each issue must be a distinct object describing a specific validation
 * problem tied to a specific Facility. Creating them inside the loop is the
 * cleanest, most correct, and safest implementation for this domain.
 *
 * For these reasons, the PMD rule is intentionally suppressed here.
 */
@SuppressWarnings("PMD.AvoidInstantiatingObjectsInLoops")
public class FacilityValidationService {

    private static final Set<String> VALID_PROVINCES = Set.of(
            "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU",
            "ON", "PE", "QC", "SK", "YT"
    );

    @Autowired
    private FacilityRepository facilityRepository;

    /**
     * Run a full validation pass over all facilities currently in the database.
     */
    public FacilityValidationResult validateFacilities() {
        List<Facility> facilities = facilityRepository.findAll();

        FacilityValidationResult result = new FacilityValidationResult();
        result.setTotalRecords(facilities.size());

        // Count uniqueId occurrences
        Map<String, Integer> uniqueIdCounts = new HashMap<>();
        for (Facility facility : facilities) {
            String uniqueId = safeTrim(facility.getUniqueId());
            if (uniqueId != null) {
                uniqueIdCounts.merge(uniqueId, 1, Integer::sum);
            }
        }

        Set<String> duplicateUniqueIds = uniqueIdCounts.entrySet().stream()
                .filter(e -> e.getValue() > 1)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        int missingFieldCount = 0;
        int duplicateCount = 0;
        int invalidProvinceCount = 0;
        int invalidCoordinateCount = 0;

        for (Facility facility : facilities) {
            boolean missing = false;

            // Missing critical fields
            if (isBlank(facility.getUniqueId())) {
                result.addIssue(new FacilityValidationIssue(
                        facility,
                        "MISSING_FIELD",
                        "Missing uniqueId"
                ));
                missing = true;
            }
            if (isBlank(facility.getFacilityName())) {
                result.addIssue(new FacilityValidationIssue(
                        facility,
                        "MISSING_FIELD",
                        "Missing facilityName"
                ));
                missing = true;
            }
            if (isBlank(facility.getProvince())) {
                result.addIssue(new FacilityValidationIssue(
                        facility,
                        "MISSING_FIELD",
                        "Missing province"
                ));
                missing = true;
            }
            if (missing) {
                missingFieldCount++;
            }

            // Duplicate uniqueId
            String uniqueId = safeTrim(facility.getUniqueId());
            if (uniqueId != null && duplicateUniqueIds.contains(uniqueId)) {
                result.addIssue(new FacilityValidationIssue(
                        facility,
                        "DUPLICATE_UNIQUE_ID",
                        "Duplicate uniqueId: " + uniqueId
                ));
                duplicateCount++;
            }

            // Invalid province
            String province = safeTrim(facility.getProvince());
            if (province != null && !VALID_PROVINCES.contains(province)) {
                result.addIssue(new FacilityValidationIssue(
                        facility,
                        "INVALID_PROVINCE",
                        "Invalid province code: " + province
                ));
                invalidProvinceCount++;
            }

            // Invalid coordinates (optional, but useful)
            if (hasInvalidCoordinates(facility)) {
                result.addIssue(new FacilityValidationIssue(
                        facility,
                        "INVALID_COORDINATES",
                        "Invalid or incomplete latitude/longitude"
                ));
                invalidCoordinateCount++;
            }
        }

        result.setMissingFieldCount(missingFieldCount);
        result.setDuplicateUniqueIdCount(duplicateCount);
        result.setInvalidProvinceCount(invalidProvinceCount);
        result.setInvalidCoordinateCount(invalidCoordinateCount);

        result.setValid(result.getIssues().isEmpty());

        return result;
    }

    private boolean hasInvalidCoordinates(Facility facility) {
        BigDecimal lat = facility.getLatitude();
        BigDecimal lon = facility.getLongitude();

        // One present and the other missing → invalid
        if ((lat == null && lon != null) || (lat != null && lon == null)) {
            return true;
        }

        // Both missing: allowed (some records legitimately have no geometry/coords)
        if (lat == null && lon == null) {
            return false;
        }

        double latVal = lat.doubleValue();
        double lonVal = lon.doubleValue();

        return latVal < -90.0 || latVal > 90.0 || lonVal < -180.0 || lonVal > 180.0;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String safeTrim(String value) {
        return value == null ? null : value.trim();
    }
}