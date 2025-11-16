package com.efl.facilities.models.validation;

import java.util.ArrayList;
import java.util.List;

public class FacilityValidationResult {

    private boolean valid;
    private int totalRecords;

    private int missingFieldCount;
    private int duplicateUniqueIdCount;
    private int invalidProvinceCount;
    private int invalidCoordinateCount;

    private List<FacilityValidationIssue> issues = new ArrayList<>();

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public int getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(int totalRecords) {
        this.totalRecords = totalRecords;
    }

    public int getMissingFieldCount() {
        return missingFieldCount;
    }

    public void setMissingFieldCount(int missingFieldCount) {
        this.missingFieldCount = missingFieldCount;
    }

    public int getDuplicateUniqueIdCount() {
        return duplicateUniqueIdCount;
    }

    public void setDuplicateUniqueIdCount(int duplicateUniqueIdCount) {
        this.duplicateUniqueIdCount = duplicateUniqueIdCount;
    }

    public int getInvalidProvinceCount() {
        return invalidProvinceCount;
    }

    public void setInvalidProvinceCount(int invalidProvinceCount) {
        this.invalidProvinceCount = invalidProvinceCount;
    }

    public int getInvalidCoordinateCount() {
        return invalidCoordinateCount;
    }

    public void setInvalidCoordinateCount(int invalidCoordinateCount) {
        this.invalidCoordinateCount = invalidCoordinateCount;
    }

    public List<FacilityValidationIssue> getIssues() {
        return issues;
    }

    public void setIssues(List<FacilityValidationIssue> issues) {
        this.issues = issues;
    }

    public void addIssue(FacilityValidationIssue issue) {
        this.issues.add(issue);
    }
}
