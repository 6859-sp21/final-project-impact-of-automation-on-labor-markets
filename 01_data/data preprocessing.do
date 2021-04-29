cls
clear 

/* Do file – High-risk & high-share occupations

ssc install egenmore

*/

cd "/Users/lucaskitzmueller/Documents/04_Master/10_Courses/29_Data Visualization/final-project-impact-of-automation-on-labor-markets/01_data"

*-------------------------------------------------------------------------------*
* Get employment occupation satistics – CPS
*-------------------------------------------------------------------------------*
	
	do "cps.do"

	* Collapse to state and occupation level 
	keep if asecflag == 1 // keep basi survey from March
	
	* Use ASEC weight
	* "For most person-level analyses of the ASEC samples, apply the ASECWT variable. ASECWT gives the population represented by each individual in the sample."
	* https://cps.ipums.org/cps-action/faq 
	
	* Create variables for collapsing
	recode labforce 2 = 1 nonmissing = . ,gen(labforce2)
	
	* Collapse
	collapse (count) number_workers = asecwth number_workers2 = labforce2  [pweight = asecwth], by(statefip occ) fast
	drop number_workers2 // was just consistency check
	
	* Consistency check
	preserve
	drop if occ == 0
	collapse (sum) number_workers, by(statefip)
	* numbers are consistent: amazing! https://www.bls.gov/eag/eag.ca.htm 
	restore
	
	tempfile cps
	save `cps'
	
	* Data definition: This includes everyone that is in the labor force: peope in the labor force includes unemployed, but not that the retired for example
	* Data refer to place of residence. The term "civilian labor force" is used by the U.S. Bureau of Labor Statistics (BLS) to describe the subset of Americans who have jobs or are seeking a job, are at least 16 years old, are not serving in the military and are not institutionalized. In other words, all Americans who are eligible to work in the everyday U.S. economy.
	

*-------------------------------------------------------------------------------*
* Get automation risk data
*-------------------------------------------------------------------------------*

* Webb (2020) automation risk & Merge with ONET cross walk
	
	* Croswalk to ONET (provided by Webb)
	use "onet_to_occ1990dd.dta", clear
	tempfile webb_crosswalk
	save `webb_crosswalk'
	
	use "exposure_by_occ1990dd_lswt2010.dta", clear
	merge 1:m occ1990dd using `webb_crosswalk', gen(merge_wb_crosswalk)
	rename * webb_*
	rename webb_onetsoccode soccode
	drop _*
	
	* Three occupations could not be merged and therefore have no soccode. Drop them.
	count if missing(soccode)
	assert `r(N)' == 3
	drop if missing(soccode)
	
	* Dataset is now on the level of O*NET SOC code.
	gen soccode_6digits = substr(soccode,1,7) // for merging
	unique soccode
	
	* Collapse to the level of 6 digit soccode
	collapse (mean) webb_pct_software webb_pct_robot webb_pct_ai webb_lswt2010 (first) webb_occ webb_acs webb_acs_title soccode webb_onet_name webb_occ1990dd webb_occ1990dd_title , by(soccode_6digits)
	
	tempfile webb
	save `webb'
	
*-------------------------------------------------------------------------------*
* Merge datasets – EMPLOYMENT NUMBERS MASTER
*-------------------------------------------------------------------------------*


	
	exit 
	
*-------------------------------------------------------------------------------*
* Merge datasets – OCCUPATIONS MASTER
*-------------------------------------------------------------------------------*
		
	* Merge ONET SOC - CPS crosswalk into dataset
	
	
		/*
	import excel "nem-occcode-cps-crosswalk.xlsx", sheet("NEM SOC CPS crosswalk") cellrange(A5:E811) firstrow case(lower) clear
	rename hybridsoccode soccode_6digits
	drop sortorder
	rename nationalemploymentmatrixsoco cw_nationalemploymentmatrixsoco
	rename cpsoccupationaltitle cw_cpsoccupationaltitle
	unique cpscode
	unique soccode
	tempfile cw_cps_soc
	save `cw_cps_soc'
	
	import excel "nem-occcode-acs-crosswalk.xlsx", sheet("NEM SOC ACS crosswalk") cellrange(A5:E829) firstrow case(lower) clear
	rename hybridsoccode soccode_6digits
	drop sortorder
	rename nationalemploymentmatrixsoco cw_nationalemploymentmatrixsoco
	rename acsoccupationaltitle cw_acsoccupationaltitle
	unique acscode
	unique soccode
	tempfile cw_acs_soc
	save `cw_acs_soc'
	
	
	use `cps', clear
	rename occ2010 acscode
	merge m:m acscode using `cw_acs_soc'
	*/ 
		
	
	
	
/******	
	
	
* Frey & Osborne automation risk (FO) at O*NET/SOC level

	import excel "01_data/02_automation_risk/02_frey_osborne_2017/frey_osborne_2017.xlsx", ///
		sheet("Sheet1") firstrow case(lower) clear
	destring probability, replace
	rename * fo_*
	rename fo_soccode soccode_6digits
	tempfile fo
	save `fo'

* Merge Webb (2020) and Frey & Osborne (2017)

	* Webb (2020) SOC code has 8 digits. 963 observations.
	* F&O (2017) SOC code 6 digits. 702 observations.
	
	* Assumption: Merge on F&O (2017) 6-digit level. 
	* More granular Webb(2020) occupations will share the same F&O (2017) 6-digit level automation risk. (thus m:1)
	
	use `webb', clear
	merge m:1 soccode_6digits using `fo', gen(merge_webb_fo)
	
	* Merge outcome:
	* 119 occupations are in Webb (2020) but not in F & O (2017)
    * 18 occupations are in F & O (2017) but not in Webb (2020).
	
	* The dataset is still on the SOC 6 digit level.
	unique soccode_6digits
	duplicates tag soccode_6digits, gen(d)
	* br if d > 0
	drop d
	
	tempfile automation_data
	save `automation_data'
	
