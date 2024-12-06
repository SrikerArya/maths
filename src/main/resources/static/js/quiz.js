document.addEventListener("DOMContentLoaded", function() {
    let timeRemaining = [[${timer}]];
    console.log('Time remaining started: ', timeRemaining);

    function startTimer() {
        const timerElement = document.getElementById("timer");
        const hiddenTimerInput = document.getElementById("timeRemainingInput");

        const interval = setInterval(async function () {
            if (timeRemaining <= 0) {
                clearInterval(interval);
                alert("Time is up! Submitting your score.");

                // Prepare data to submit
                const data = {
                    timeRemaining: timeRemaining.toString(),
                    answer: '' // No answer because time has run out
                };

                try {
                    const response = await fetch('/submit-answer', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data), // Send as JSON
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();

                    if (result.end) {
                        // Redirect to the results page
                        window.location.href = `/quiz-results?score=${result.score}`;
                    }
                } catch (error) {
                    console.error('Error submitting answer:', error);
                }
            } else {
                timeRemaining--;
                timerElement.innerHTML = `${timeRemaining}`;
                hiddenTimerInput.value = timeRemaining;
                console.log('Time remaining: ', timeRemaining);
            }
        }, 1000);
    }

    function submitAnswer() {
        const answerInput = document.getElementById("answerInput");
        const timeRemainingInput = document.getElementById("timeRemainingInput");
        const questionText = document.getElementById("questionText");
        const scoreText = document.getElementById("scoreText");

        const data = {
            answer: answerInput.value,
            timeRemaining: timeRemainingInput.value
        };

        fetch('/submit-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {
            // Update the UI with the new question, score, etc.
            questionText.innerText = result.question;
            scoreText.innerText = result.score;
            answerInput.value = ""; // Clear the input
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    window.onload = function () {
        startTimer(); // Start the timer when the page loads
    };