package com.efl.facilities.models.validation;

import com.efl.facilities.models.Facility;

public class FacilityValidationIssue {

    private Long id;
    private String uniqueId;
    private String facilityName;
    private String issueType; // e.g. MISSING_FIELD, DUPLICATE_UNIQUE_ID, INVALID_PROVINCE, INVALID_COORDINATES
    private String message;

    public FacilityValidationIssue() {
    }

    public FacilityValidationIssue(Facility facility, String issueType, String message) {
        if (facility != null) {
            this.id = facility.getId();
            this.uniqueId = facility.getUniqueId();
            this.facilityName = facility.getFacilityName();
        }
        this.issueType = issueType;
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUniqueId() {
        return uniqueId;
    }

    public void setUniqueId(String uniqueId) {
        this.uniqueId = uniqueId;
    }

    public String getFacilityName() {
        return facilityName;
    }

    public void setFacilityName(String facilityName) {
        this.facilityName = facilityName;
    }

    public String getIssueType() {
        return issueType;
    }

    public void setIssueType(String issueType) {
        this.issueType = issueType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
