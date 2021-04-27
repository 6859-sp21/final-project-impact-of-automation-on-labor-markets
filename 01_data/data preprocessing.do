cls
clear 

/* Do file – High-risk & high-share occupations

ssc install egenmore

*/

cd "/Users/lucaskitzmueller/Documents/04_Master/10_Courses/29_Data Visualization/data viz final project/"



*-------------------------------------------------------------------------------*
* Get employment occupation satistics by state
*-------------------------------------------------------------------------------*




*-------------------------------------------------------------------------------*
* Get automation risk data
*-------------------------------------------------------------------------------*

* Webb (2020) automation risk on OCC 1990 level
	
	* Croswalk to ONET (provided by Webb)
	use "01_data/onet_to_occ1990dd.dta", clear
	tempfile webb_crosswalk
	save `webb_crosswalk'
	
	use "01_data//exposure_by_occ1990dd_lswt2010.dta", clear
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
	tempfile webb
	save `webb'
	
	
	
	
	
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
	
