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

        Map<String, Integer> uniqueIdCounts = countUniqueIds(facilities);
        Set<String> duplicateUniqueIds = extractDuplicateUniqueIds(uniqueIdCounts);

        ValidationCounters counters =
                validateFacilitiesAndCountIssues(facilities, duplicateUniqueIds, result);

        result.setMissingFieldCount(counters.missingFieldCount);
        result.setDuplicateUniqueIdCount(counters.duplicateCount);
        result.setInvalidProvinceCount(counters.invalidProvinceCount);
        result.setInvalidCoordinateCount(counters.invalidCoordinateCount);

        result.setValid(result.getIssues().isEmpty());

        return result;
    }

    private Map<String, Integer> countUniqueIds(List<Facility> facilities) {
        Map<String, Integer> uniqueIdCounts = new HashMap<>();
        for (Facility facility : facilities) {
            String uniqueId = safeTrim(facility.getUniqueId());
            if (uniqueId != null) {
                uniqueIdCounts.merge(uniqueId, 1, Integer::sum);
            }
        }
        return uniqueIdCounts;
    }

    private Set<String> extractDuplicateUniqueIds(Map<String, Integer> uniqueIdCounts) {
        return uniqueIdCounts.entrySet().stream()
                .filter(e -> e.getValue() > 1)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
    }

    private ValidationCounters validateFacilitiesAndCountIssues(
            List<Facility> facilities,
            Set<String> duplicateUniqueIds,
            FacilityValidationResult result
    ) {
        ValidationCounters counters = new ValidationCounters();

        for (Facility facility : facilities) {
            if (hasMissingCriticalFields(facility, result)) {
                counters.missingFieldCount++;
            }

            if (hasDuplicateUniqueId(facility, duplicateUniqueIds, result)) {
                counters.duplicateCount++;
            }

            if (hasInvalidProvince(facility, result)) {
                counters.invalidProvinceCount++;
            }

            if (hasInvalidCoordinatesAndReport(facility, result)) {
                counters.invalidCoordinateCount++;
            }
        }

        return counters;
    }

    private boolean hasMissingCriticalFields(Facility facility, FacilityValidationResult result) {
        boolean missing = false;

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

        return missing;
    }

    private boolean hasDuplicateUniqueId(
            Facility facility,
            Set<String> duplicateUniqueIds,
            FacilityValidationResult result
    ) {
        String uniqueId = safeTrim(facility.getUniqueId());
        if (uniqueId != null && duplicateUniqueIds.contains(uniqueId)) {
            result.addIssue(new FacilityValidationIssue(
                    facility,
                    "DUPLICATE_UNIQUE_ID",
                    "Duplicate uniqueId: " + uniqueId
            ));
            return true;
        }
        return false;
    }

    private boolean hasInvalidProvince(Facility facility, FacilityValidationResult result) {
        String province = safeTrim(facility.getProvince());
        if (province != null && !VALID_PROVINCES.contains(province)) {
            result.addIssue(new FacilityValidationIssue(
                    facility,
                    "INVALID_PROVINCE",
                    "Invalid province code: " + province
            ));
            return true;
        }
        return false;
    }

    private boolean hasInvalidCoordinatesAndReport(
            Facility facility,
            FacilityValidationResult result
    ) {
        if (hasInvalidCoordinates(facility)) {
            result.addIssue(new FacilityValidationIssue(
                    facility,
                    "INVALID_COORDINATES",
                    "Invalid or incomplete latitude/longitude"
            ));
            return true;
        }
        return false;
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

    private static class ValidationCounters {
        int missingFieldCount;
        int duplicateCount;
        int invalidProvinceCount;
        int invalidCoordinateCount;
    }
}
