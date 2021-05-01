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
	collapse (count) number_workers = asecwth number_workers2 = labforce2  [pweight = asecwth], by(statefip occ2010) fast
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
	
	* Create 6-sigit ACS code
	gen soccode_6digits = substr(soccode,1,7) // for merging
	replace soccode_6digits = subinstr(soccode_6digits, "-", "",.)
	unique soccode_6digits
	
	* Collapse to the level of 6 digit soccode
	*collapse (mean) webb_pct_software webb_pct_robot webb_pct_ai webb_lswt2010 (first) webb_occ webb_acs webb_acs_title soccode webb_onet_name webb_occ1990dd webb_occ1990dd_title , by(soccode_6digits)	
	
	tempfile webb_raw
	save `webb_raw'
	
	* Collapse to the level of ACS code in weeb
	collapse (mean) webb_pct_software webb_pct_robot webb_pct_ai webb_lswt2010 (first) webb_occ soccode_6digits webb_acs_title soccode webb_onet_name webb_occ1990dd webb_occ1990dd_title , by(webb_acs)
	replace webb_acs_title = webb_occ1990dd_title if mi(webb_acs_title)
	rename webb_acs acscode
	
	tempfile webb
	save `webb'
	
*-------------------------------------------------------------------------------*
* Merge datasets: Employment and Occupation Risk
*-------------------------------------------------------------------------------*

	* Open crosswalk: CPS OCC2010 - ACS code
	import excel "occ_occsoc_crosswalk_2000_onward.xlsx", sheet("Sheet1") firstrow case(lower) clear
	drop if missing(acscode)
	tempfile cw_acs_soc
	save `cw_acs_soc'
	
	* Open CPS data and merge in crosswalk on CPS code
	use `cps', clear
	rename occ2010 cpscode
	merge m:1 cpscode using `cw_acs_soc', gen(_merge_cw)
	* br if _merge_cw == 1
	* the only ones that don't merge from master are NIU so all good.
	 
	drop if _merge_cw == 2 // flag! these are the ones that later don't merge

	* Now use ACS code to merge in Webb data
	*rename soccode soccode_6digits
	merge m:1 acscode using `webb', gen(_merge_webb)
	* Some occupations included in the CPS data are not in the Webb data – which is fine
	
	tempfile master
	save `master'
	  
*-------------------------------------------------------------------------------*
* Create state level data with aggregate AI automation risk
*-------------------------------------------------------------------------------*

	use `master', clear

	drop if cpscode == 9999 // drop people not in workforce (these are people without automation info)
	
	*drop if state != 25 
	*br if !mi(webb_pct_ai) 	
		
	*collapse (mean) webb_pct_software webb_pct_robot webb_pct_ai, by(acscode webb_acs_title) 
	collapse (mean) webb_pct_software webb_pct_robot webb_pct_ai [pweight = number_workers], by(statefip)
	
	tempfile collapsed
	save `collapsed'
	
	* get top 5 occupations by state
	use `master', clear
	gsort statefip -number_workers
	drop if missing(webb_acs_title) // these are the ones where I couldn't merge to WEBB data
	
	by statefip : keep if _n <= 5
	by statefip: gen rank = _n
	keep statefip number_workers webb_pct* acscode rank webb_acs_title
	reshape wide acscode webb_acs_title number_workers webb_pct* , i(statefip) j(rank)  
	
	
	export delimited using "state_risk.csv", replace
	exit 
	
*-------------------------------------------------------------------------------*
* Create occupation level data with AI automation risk
*-------------------------------------------------------------------------------*
	
	* https://data.bls.gov/projections/occupationProj
	import delimited "Employment Projections.csv", stripquote(yes) clear 
	rename occupationcode	soccode_6digits
	replace soccode_6digits = subinstr(soccode_6digits, "-", "",.)
	replace soccode_6digits = subinstr(soccode_6digits, "=", "",.)
	gen soccode_4digits = substr(soccode_6digits,1,5) // for merging
	destring employment2019, replace
	destring medianannualwage2020, replace
	tempfile bls
	save `bls'
	
	* Collapse webb to soc 6 digits 
	use `webb_raw', clear
	collapse (mean) webb_pct_software webb_pct_robot webb_pct_ai webb_lswt2010 (first) webb_occ webb_acs webb_acs_title soccode webb_onet_name webb_occ1990dd webb_occ1990dd_title , by(soccode_6digits)	
	gen soccode_4digits = substr(soccode_6digits,1,5) // for merging
	save `webb_raw', replace
	
	use `bls', clear
	merge 1:1 soccode_6digits using `webb_raw', gen(_merge_webb)
	save `master', replace
	keep if _merge_webb == 3
	tempfile alread_merged
	save `alread_merged'
		* Merge remaining on 4 digits; trea
		use `master'
		keep if _merge_webb == 1
		unique soccode_4digits
		merge m:m soccode_4digits using `webb_raw', gen(_merge_webb_2) update
		keep if _merge_webb_2 == 5  | _merge_webb_2==1
		unique soccode_6digits
		collapse (mean) webb_pct_software webb_pct_robot webb_pct_ai webb_lswt2010 employment2019 employmentpercentchange20192029 occupationalopenings20192029annu medianannualwage2020 (first) typicalentryleveleducation educationcode workexperienceinarelatedoccupati workexcode typicalonthejobtraining, by(soccode_6digits)
		tempfile second_merge
		save `second_merge'
	
	use `alread_merged', clear
	append using `second_merge'
	export delimited using "occupat_risk.csv", replace
	
	bysort typicalentryleveleducation: su webb_pct_ai 
	bysort typicalentryleveleducation: su webb_pct_robot 
	
	exit 
	
	
*-------------------------------------------------------------------------------*
* Create occupation level data with AI automation risk
*-------------------------------------------------------------------------------*
	
	use `master', clear
	
	drop if cpscode == 9999 // drop people not in workforce (these are people without automation info)
	
	collapse (mean) webb_pct_software webb_pct_robot webb_pct_ai  (sum) number_workers, by(acscode webb_acs_title)

	export delimited using "occupat_risk.csv", replace
	
	

	
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
	
