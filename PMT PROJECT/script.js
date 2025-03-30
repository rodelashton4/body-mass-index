document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const bmiForm = document.getElementById('bmiForm');
    const unitSystem = document.getElementById('unitSystem');
    const resultDiv = document.getElementById('result');
    const bmiValue = document.getElementById('bmiValue');
    const bmiCategory = document.getElementById('bmiCategory');
    const tipsDiv = document.getElementById('aiTips');

    // Toggle unit system visibility
    unitSystem.addEventListener('change', function() {
        const isMetric = this.value === 'metric';
        document.getElementById('metricFields').style.display = isMetric ? 'block' : 'none';
        document.getElementById('imperialFields').style.display = isMetric ? 'none' : 'block';
    });

    // Form submission handler
    bmiForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get values based on unit system
        const isMetric = unitSystem.value === 'metric';
        let weight, height, bmi;
        
        try {
            if (isMetric) {
                weight = parseFloat(document.getElementById('weightKg').value);
                height = parseFloat(document.getElementById('heightCm').value);
                
                // Validate inputs
                if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
                    throw new Error('Please enter valid weight and height values');
                }
                
                // Convert height from cm to meters
                height = height / 100;
                bmi = weight / (height * height);
            } else {
                // Imperial calculation remains the same
                weight = parseFloat(document.getElementById('weightLbs').value);
                const feet = parseFloat(document.getElementById('heightFeet').value);
                const inches = parseFloat(document.getElementById('heightInches').value);
                
                if (isNaN(weight) || isNaN(feet) || isNaN(inches) || weight <= 0 || feet <= 0) {
                    throw new Error('Please enter valid weight and height values');
                }
                
                height = feet * 12 + inches;
                bmi = (weight / (height * height)) * 703;
            }
            
            // Display results
            displayResults(bmi);
            
            // Generate health tips
            generateHealthTips(bmi);
            
        } catch (error) {
            alert(error.message);
        }
    });

    function displayResults(bmi) {
        bmiValue.textContent = bmi.toFixed(1);
        
        // Determine category
        let category, categoryClass;
        if (bmi < 18.5) {
            category = 'Underweight';
            categoryClass = 'underweight';
        } else if (bmi < 25) {
            category = 'Normal weight';
            categoryClass = 'normal';
        } else if (bmi < 30) {
            category = 'Overweight';
            categoryClass = 'overweight';
        } else {
            category = 'Obese';
            categoryClass = 'obese';
        }
        
        bmiCategory.textContent = category;
        resultDiv.className = 'result ' + categoryClass;
        resultDiv.style.display = 'block';
    }

    function generateHealthTips(bmi) {
        const tipsContent = document.getElementById('tipsContent');
        let tips = '';
        
        if (bmi < 18.5) {
            tips = `Underweight tips...`;
        } else if (bmi < 25) {
            tips = `Normal weight tips...`;
        } else if (bmi < 30) {
            tips = `Overweight tips...`;
        } else {
            tips = `Obese tips...`;
        }
        
        tipsContent.innerHTML = tips;
        tipsDiv.style.display = 'block';
    }
});
document.addEventListener('DOMContentLoaded', function() {
    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    let slideInterval;

    function showTestimonial(n) {
        // Wrap around if at end
        currentTestimonial = (n + testimonials.length) % testimonials.length;
        
        // Update testimonials
        testimonials.forEach((testimonial, index) => {
            testimonial.classList.toggle('active', index === currentTestimonial);
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentTestimonial);
        });
    }

    function nextTestimonial() {
        showTestimonial(currentTestimonial + 1);
    }

    // Click handlers for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(slideInterval); // Pause auto-rotation when manually clicked
            showTestimonial(index);
            startSlider(); // Restart auto-rotation after manual interaction
        });
    });

    function startSlider() {
        clearInterval(slideInterval); // Clear any existing interval
        slideInterval = setInterval(nextTestimonial, 5000); // Rotate every 5 seconds
    }

    // Initialize
    showTestimonial(0);
    startSlider();
});

// Start animation when stats section is in view
const statsSection = document.querySelector('.stats');
const observer = new IntersectionObserver((entries) => {
    if(entries[0].isIntersecting) {
        animateCounters();
    }
});

observer.observe(statsSection);

// Add at the top of your script
let bmiHistory = JSON.parse(localStorage.getItem('bmiHistory')) || [];

function saveBmiRecord(bmi) {
    const record = {
        date: new Date().toISOString(),
        bmi: bmi,
        weight: unitSystem.value === 'metric' 
            ? document.getElementById('weightKg').value 
            : document.getElementById('weightLbs').value,
        height: unitSystem.value === 'metric'
            ? document.getElementById('heightCm').value
            : document.getElementById('heightIn').value,
        unitSystem: unitSystem.value
    };
    
    bmiHistory.push(record);
    localStorage.setItem('bmiHistory', JSON.stringify(bmiHistory));
}

// Call this after calculating BMI in your form submit handler
saveBmiRecord(bmi);

let bmiChart;

function showHistoryChart() {
    const historyDiv = document.getElementById('bmiHistory');
    historyDiv.style.display = 'block';
    
    // Group data based on current view (daily/weekly/monthly)
    renderChart('daily');
    
    // Add event listeners for view buttons
    document.getElementById('viewDaily').addEventListener('click', () => renderChart('daily'));
    document.getElementById('viewWeekly').addEventListener('click', () => renderChart('weekly'));
    document.getElementById('viewMonthly').addEventListener('click', () => renderChart('monthly'));
}

function renderChart(viewMode) {
    const ctx = document.getElementById('bmiChart').getContext('2d');
    
    // Process data based on view mode
    const processedData = processHistoryData(viewMode);
    
    if (bmiChart) {
        bmiChart.destroy();
    }
    
    bmiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: processedData.labels,
            datasets: [{
                label: 'BMI',
                data: processedData.values,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'BMI Value'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            const record = processedData.records[index];
                            return `Weight: ${record.weight} ${record.unitSystem === 'metric' ? 'kg' : 'lbs'}\nHeight: ${record.height} ${record.unitSystem === 'metric' ? 'cm' : 'in'}`;
                        }
                    }
                }
            }
        }
    });
}

function processHistoryData(viewMode) {
    // Group data by day/week/month
    const grouped = {};
    const now = new Date();
    
    bmiHistory.forEach(record => {
        const date = new Date(record.date);
        let key;
        
        if (viewMode === 'daily') {
            key = date.toLocaleDateString();
        } else if (viewMode === 'weekly') {
            // Get week number
            const oneJan = new Date(date.getFullYear(), 0, 1);
            const weekNumber = Math.ceil((((date - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
            key = `Week ${weekNumber}, ${date.getFullYear()}`;
        } else { // monthly
            key = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
        }
        
        if (!grouped[key]) {
            grouped[key] = {
                total: 0,
                count: 0,
                records: []
            };
        }
        
        grouped[key].total += record.bmi;
        grouped[key].count++;
        grouped[key].records.push(record);
    });
    
    // Calculate averages and prepare chart data
    const labels = [];
    const values = [];
    const records = [];
    
    Object.keys(grouped).sort().forEach(key => {
        labels.push(key);
        values.push(grouped[key].total / grouped[key].count);
        records.push(grouped[key].records[0]); // Use first record for tooltip
    });
    
    return { labels, values, records };
}

function displayResults(bmi) {
    // ... existing code ...
    
    // Show history chart if we have previous data
    if (bmiHistory.length > 0) {
        showHistoryChart();
    }
    
    // Scroll to results
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}
