import React, { useState, useEffect, useCallback } from 'react'; 
import './ROICalculator.css';

const ROICalculator = () => {
    // Language state
    const [language, setLanguage] = useState('en');

    // Assumptions (can be easily modified here)
    const [assumptions, setAssumptions] = useState({
        percentSevereSymptoms: 75,
        avgMenopauseTransitionYears: 8.5,
        resigningPercentage: 10,
        partTimePercentage: 24,
        reductionAssumption: 25,
        jobChangePercentage: 18,
        replacementCostLower: 0.5,
        replacementCostHigher: 2,
        percentSickDueToSymptoms: 30, // Percentage of women with sick days due to menopause symptoms
        evelaMonthlySubscription: 9.9,
        avgSickDays: 25 // Average yearly sick leave days for female employees > 40
    });

    // State for employee data
    const [numEmployees, setNumEmployees] = useState(500);
    const [percentFemale, setPercentFemale] = useState(50);
    const [percentFemaleOver40, setPercentFemaleOver40] = useState(40);
    const [avgSalary, setAvgSalary] = useState(3750); // Default average monthly salary of a female employee over 40
    const [avgSickLeave, setAvgSickLeave] = useState(25); // Default average yearly sick leave days for female employees over 40

    // Calculated values
    const [numMenopauseTransition, setNumMenopauseTransition] = useState('');
    const [costSickDays, setCostSickDays] = useState('');
    const [yearlyReplacementCost, setYearlyReplacementCost] = useState('');
    const [totalYearlyCost, setTotalYearlyCost] = useState('');
    const [evelaCost, setEvelaCost] = useState('');
    const [roi, setROI] = useState('');

    // Helper function to round up and ensure non-negative numbers
    const roundUp = (value) => Math.max(Math.ceil(value), 0);

    // Helper function to format numbers with commas
    const formatNumber = (number) => number.toLocaleString();

    // Helper function to check if all inputs are filled
    const allInputsFilled = useCallback(() => {
        return (
            numEmployees !== '' &&
            percentFemale !== '' &&
            percentFemaleOver40 !== '' &&
            avgSalary !== '' &&
            avgSickLeave !== ''
        );
    }, [numEmployees, percentFemale, percentFemaleOver40, avgSalary, avgSickLeave]);

    // Handle arrow key navigation between inputs
    const handleKeyDown = (e, currentIndex) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            const nextElement = document.querySelector(`[data-index="${currentIndex + 1}"]`);
            if (nextElement) {
                nextElement.focus();
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prevElement = document.querySelector(`[data-index="${currentIndex - 1}"]`);
            if (prevElement) {
                prevElement.focus();
            }
        }
    };

    // Calculate the number of employees experiencing menopause transition
    useEffect(() => {
        if (allInputsFilled()) {
            const calculatedNumMenopauseTransition = roundUp(numEmployees * (percentFemale / 100) * (percentFemaleOver40 / 100));
            setNumMenopauseTransition(calculatedNumMenopauseTransition);
        } else {
            setNumMenopauseTransition('');
            setCostSickDays('');
            setYearlyReplacementCost('');
            setTotalYearlyCost('');
            setEvelaCost('');
            setROI('');
        }
    }, [numEmployees, percentFemale, percentFemaleOver40, avgSalary, avgSickLeave, allInputsFilled]);

    // Update assumptions based on calculated values
    useEffect(() => {
        if (allInputsFilled()) {
            const updatedAssumptions = {
                ...assumptions,
                numWomenEnteringMenopause: roundUp(numMenopauseTransition / 25),
                salaryPerWorkingDay: roundUp((avgSalary * 12) / 220),
                avgSickDaysWithoutVSM: avgSickLeave / (0.44 * 1.57 + 0.66),
                avgSickDaysWithVSM: (avgSickLeave / (0.44 * 1.57 + 0.66)) * 1.57,
            };
            setAssumptions(updatedAssumptions);
        }
    }, [numMenopauseTransition, avgSalary, avgSickLeave, allInputsFilled, assumptions]);

    // Calculate the cost for sick days due to untreated menopause symptoms
    useEffect(() => {
        if (allInputsFilled()) {
            const differenceInSickDays = assumptions.avgSickDaysWithVSM - assumptions.avgSickDaysWithoutVSM;
            const adjustedSickDays = differenceInSickDays * (assumptions.percentSickDueToSymptoms / 100);
            const costPerEmployee = adjustedSickDays * assumptions.salaryPerWorkingDay;
            const calculatedCostSickDays = roundUp(costPerEmployee * numMenopauseTransition);
            setCostSickDays(calculatedCostSickDays);
        } else {
            setCostSickDays('');
        }
    }, [assumptions, numMenopauseTransition, allInputsFilled]);

    // Calculate the yearly replacement cost for part time/early retirement/job change
    useEffect(() => {
        if (allInputsFilled()) {
            const partTimeCost = roundUp(
                (numMenopauseTransition / 25) *
                (assumptions.partTimePercentage / 100) *
                (assumptions.reductionAssumption / 100) *
                avgSalary * 12 *
                assumptions.replacementCostLower
            );

            const resignCost = roundUp(
                (numMenopauseTransition / 25) *
                (assumptions.resigningPercentage / 100) *
                avgSalary * 12 *
                assumptions.replacementCostLower
            );

            const jobChangeCost = roundUp(
                (numMenopauseTransition / 25) *
                (assumptions.jobChangePercentage / 100) *
                avgSalary * 12 *
                assumptions.replacementCostLower
            );

            const calculatedYearlyReplacementCost = partTimeCost + resignCost + jobChangeCost;
            setYearlyReplacementCost(calculatedYearlyReplacementCost);
        } else {
            setYearlyReplacementCost('');
        }
    }, [assumptions, numMenopauseTransition, avgSalary, allInputsFilled]);

    // Calculate the total yearly cost due to untreated menopause symptoms
    useEffect(() => {
        if (allInputsFilled()) {
            const calculatedTotalYearlyCost = roundUp(costSickDays + yearlyReplacementCost);
            setTotalYearlyCost(calculatedTotalYearlyCost);
        } else {
            setTotalYearlyCost('');
        }
    }, [costSickDays, yearlyReplacementCost, allInputsFilled]);

    // Calculate the yearly Evela program cost
    useEffect(() => {
        if (allInputsFilled()) {
            const calculatedEvelaCost = roundUp(assumptions.evelaMonthlySubscription * numMenopauseTransition * 12);
            setEvelaCost(calculatedEvelaCost);
        } else {
            setEvelaCost('');
        }
    }, [assumptions.evelaMonthlySubscription, numMenopauseTransition, allInputsFilled]);

    // Calculate the ROI
    useEffect(() => {
        if (allInputsFilled() && evelaCost > 0) {
            const calculatedROI = Math.round((totalYearlyCost - evelaCost) / evelaCost * 100);
            setROI((calculatedROI / 100) % 1 === 0 ? (calculatedROI / 100) : (calculatedROI / 100).toFixed(1));
        } else {
            setROI(''); // Set ROI as an empty string if any input is missing
        }
    }, [totalYearlyCost, evelaCost, allInputsFilled]);

    return (
        <div className="roi-calculator" style={{ padding: '10px' }}>
            <div className="roi-calculator-container" style={{ padding: '10px', maxWidth: '700px', position: 'relative' }}>
                <div className="language-toggle" style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px', fontSize: '0.9em' }}>
                    <span className={`language-label ${language === 'en' ? 'bold' : ''}`} onClick={() => setLanguage('en')} style={{ cursor: 'pointer', fontWeight: language === 'en' ? 'bold' : 'normal' }}>EN</span>
                    <span>/</span>
                    <span className={`language-label ${language === 'de' ? 'bold' : ''}`} onClick={() => setLanguage('de')} style={{ cursor: 'pointer', fontWeight: language === 'de' ? 'bold' : 'normal' }}>DE</span>
                </div>
                <div className="roi-calculator-header" style={{ marginBottom: '10px' }}>
                <h2 className="title">Evela Health ROI Calculator</h2>
                </div>

                <div className="input-group compact-layout" style={{ gap: '4px' }}>
                    <div className="input-item compact-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label htmlFor="numEmployees" style={{ flex: '1', fontSize: '0.85em' }}><em>{language === 'en' ? 'No. of employees in your organization' : 'Anzahl der Mitarbeitenden in Ihrer Organisation'}</em></label>
                        <input type="number" id="numEmployees" value={numEmployees || ""} data-index="0" onKeyDown={(e) => handleKeyDown(e, 0)} onChange={(e) => setNumEmployees(Number(e.target.value))} style={{ flex: '1', padding: '4px' }} />
                    </div>
                    <div className="input-item compact-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label htmlFor="percentFemale" style={{ flex: '1', fontSize: '0.85em' }}><em>{language === 'en' ? '% of female employees' : '% Mitarbeiterinnen'}</em></label>
                        <input
                            type="number"
                            id="percentFemale"
                            value={percentFemale === 0 ? '' : percentFemale}
                            data-index="1"
                            onKeyDown={(e) => handleKeyDown(e, 1)}
                            onChange={(e) => setPercentFemale(e.target.value === '' ? 0 : Math.min(100, Number(e.target.value)))}
                            style={{ padding: '4px', width: '100%' }}
                            min="0"
                            max="100"
                        />
                    </div>
                    <div className="input-item compact-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label htmlFor="percentFemaleOver40" style={{ flex: '1', fontSize: '0.85em' }}><em>{language === 'en' ? '% of female employees over 40' : '% Mitarbeiterinnen über 40'}</em></label>
                        <input
                            type="number"
                            id="percentFemaleOver40"
                            value={percentFemaleOver40 === 0 ? '' : percentFemaleOver40}
                            data-index="2"
                            onKeyDown={(e) => handleKeyDown(e, 2)}
                            onChange={(e) => setPercentFemaleOver40(e.target.value === '' ? 0 : Math.min(100, Number(e.target.value)))}
                            style={{ padding: '4px', width: '100%' }}
                            min="0"
                            max="100"
                        />
                    </div>
                    <div className="input-item compact-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label htmlFor="avgSalary" style={{ flex: '1', fontSize: '0.85em' }}><em>{language === 'en' ? 'Average monthly gross salary of a female employee > 40' : 'Durchschnittliches monatliches Bruttogehalt einer Mitarbeiterin > 40'}</em></label>
                        <input type="number" id="avgSalary" min="0" value={avgSalary || ""} data-index="3" onKeyDown={(e) => handleKeyDown(e, 3)} onChange={(e) => setAvgSalary(e.target.value === '' ? '' : Number(e.target.value))} style={{ flex: '1', padding: '4px' }} />
                    </div>
                    <div className="input-item compact-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label htmlFor="avgSickLeave" style={{ flex: '1', fontSize: '0.85em' }}><em>{language === 'en' ? 'Average yearly sick leave days for female employees > 40' : 'Durchschnittliche jährliche Krankheitstage für Mitarbeiterinnen > 40'}</em></label>
                        <input type="number" id="avgSickLeave" min="0" value={avgSickLeave || ""} data-index="4" onKeyDown={(e) => handleKeyDown(e, 4)} onChange={(e) => setAvgSickLeave(e.target.value === '' ? '' : Number(e.target.value))} style={{ flex: '1', padding: '4px' }} />
                    </div>
                </div>

                {/* Separated Section for Total Cost, Evela Program Cost, and ROI */}
                <div className="separator" style={{ margin: '10px 0' }}></div>
                <div className="input-group compact-layout" style={{ gap: '4px' }}>
                    <div className="input-item compact-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label htmlFor="numMenopauseTransition" style={{ flex: '1', fontSize: '0.85em' }}><em>{language === 'en' ? 'No. of employees experiencing menopause transition' : 'Anzahl der Mitarbeiterinnen, die in den Wechseljahren sind'}</em></label>
                        <input type="text" id="numMenopauseTransition" value={numMenopauseTransition ? formatNumber(numMenopauseTransition) : ""} readOnly style={{ flex: '1', padding: '4px' }} />
                    </div>
                    <div className="input-item compact-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label htmlFor="costSickDays" style={{ flex: '1', fontSize: '0.85em' }}><em>{language === 'en' ? 'Cost for sick days due to untreated menopause symptoms' : 'Kosten für Krankheitstage aufgrund unbehandelter Wechseljahresbeschwerden'}</em></label>
                        <input type="text" id="costSickDays" value={costSickDays ? `€${formatNumber(costSickDays)}` : ""} readOnly style={{ flex: '1', padding: '4px' }} />
                    </div>
                    <div className="input-item compact-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label htmlFor="yearlyReplacementCost" style={{ flex: '1', fontSize: '0.85em' }}><em>{language === 'en' ? 'Yearly replacement cost for part time / early retirement / job change' : 'Jährliche Ersatzkosten für Teilzeit / Frühverrentung / Jobwechsel'}</em></label>
                        <input type="text" id="yearlyReplacementCost" value={yearlyReplacementCost ? `€${formatNumber(yearlyReplacementCost)}` : ""} readOnly style={{ flex: '1', padding: '4px' }} />
                    </div>
                    <div className="input-item compact-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
    <label htmlFor="totalYearlyCost" style={{ flex: '1', fontSize: '0.85em', fontWeight: 'bold' }}>
        {language === 'en' ? 'Total yearly cost due to untreated menopause symptoms' : 'Jährliche Gesamtkosten durch unbehandelte Wechseljahresbeschwerden'}
    </label>
    <input
        type="text"
        id="totalYearlyCost"
        value={totalYearlyCost ? `€${formatNumber(totalYearlyCost)}` : ""}
        readOnly
        style={{ flex: '1', padding: '4px', fontWeight: 'bold' }}
    />
</div>
                    <div className="separator" style={{ margin: '10px 0' }}></div>
                    <div className="input-item compact-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label htmlFor="evelaCost" style={{ flex: '1', fontSize: '0.85em' }}><em>{language === 'en' ? 'Yearly Evela program cost' : 'Jährliche Evela-Programmkosten'}</em></label>
                        <input type="text" id="evelaCost" value={evelaCost ? `€${formatNumber(evelaCost)}` : ""} readOnly style={{ flex: '1', padding: '4px' }} />
                    </div>
                    <div className="input-item compact-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label htmlFor="totalCostSavings" style={{ flex: '1', fontSize: '0.85em' }}><em>{language === 'en' ? 'Total cost savings' : 'Gesamtkosteneinsparungen'}</em></label>
                        <input type="text" id="totalCostSavings" value={totalYearlyCost && evelaCost ? `€${formatNumber(totalYearlyCost - evelaCost)}` : ""} readOnly style={{ flex: '1', padding: '4px' }} />
                    </div>
                    <div className="input-item compact-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label htmlFor="roi" style={{ flex: '1', fontSize: '0.85em', fontWeight: 'bold' }}><strong>{language === 'en' ? 'ROI' : 'ROI'}</strong></label>
                        <input type="text" id="roi" value={roi || ""} readOnly style={{ flex: '1', padding: '4px', fontWeight: 'bold' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ROICalculator;
