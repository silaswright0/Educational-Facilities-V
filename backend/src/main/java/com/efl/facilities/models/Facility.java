package com.efl.facilities.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "educational_facility")
public class Facility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String uniqueId;

    @Column(nullable = false)
    private String facilityName;

    private String facilityType;
    private String authorityName;
    private String address;
    private String unit;
    private String postalCode;
    private String municipalityName;
    private String province;
    private String sourceId;
    private String minGrade;
    private String maxGrade;

    private Boolean languageMinorityStatus;
    private Boolean frenchImmersion;
    private Boolean earlyImmersion;
    private Boolean middleImmersion;
    private Boolean lateImmersion;

    private String censusDivisionName;
    private String censusDivisionId;
    private String geometry;
    
    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;
    
    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    private LocalDate dateUpdated;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUniqueId() { return uniqueId; }
    public void setUniqueId(String uniqueId) { this.uniqueId = uniqueId; }

    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

    public String getFacilityType() { return facilityType; }
    public void setFacilityType(String facilityType) { this.facilityType = facilityType; }

    public String getAuthorityName() { return authorityName; }
    public void setAuthorityName(String authorityName) { this.authorityName = authorityName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getMunicipalityName() { return municipalityName; }
    public void setMunicipalityName(String municipalityName) { this.municipalityName = municipalityName; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }

    public String getMinGrade() { return minGrade; }
    public void setMinGrade(String minGrade) { this.minGrade = minGrade; }

    public String getMaxGrade() { return maxGrade; }
    public void setMaxGrade(String maxGrade) { this.maxGrade = maxGrade; }

    public Boolean getLanguageMinorityStatus() { return languageMinorityStatus; }
    public void setLanguageMinorityStatus(Boolean languageMinorityStatus) { this.languageMinorityStatus = languageMinorityStatus; }

    public Boolean getFrenchImmersion() { return frenchImmersion; }
    public void setFrenchImmersion(Boolean frenchImmersion) { this.frenchImmersion = frenchImmersion; }

    public Boolean getEarlyImmersion() { return earlyImmersion; }
    public void setEarlyImmersion(Boolean earlyImmersion) { this.earlyImmersion = earlyImmersion; }

    public Boolean getMiddleImmersion() { return middleImmersion; }
    public void setMiddleImmersion(Boolean middleImmersion) { this.middleImmersion = middleImmersion; }

    public Boolean getLateImmersion() { return lateImmersion; }
    public void setLateImmersion(Boolean lateImmersion) { this.lateImmersion = lateImmersion; }

    public String getCensusDivisionName() { return censusDivisionName; }
    public void setCensusDivisionName(String censusDivisionName) { this.censusDivisionName = censusDivisionName; }

    public String getCensusDivisionId() { return censusDivisionId; }
    public void setCensusDivisionId(String censusDivisionId) { this.censusDivisionId = censusDivisionId; }

    public String getGeometry() { return geometry; }
    public void setGeometry(String geometry) { this.geometry = geometry; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public LocalDate getDateUpdated() { return dateUpdated; }
    public void setDateUpdated(LocalDate dateUpdated) { this.dateUpdated = dateUpdated; }
}