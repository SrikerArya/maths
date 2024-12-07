    let timeRemaining = window.initialTimeRemaining;
    let totalQuestionsAsked = 0; // Track the total number of questions asked
    let audioEnabled = 0;

    console.log('Time remaining started: ', timeRemaining);

    function speak(text) {
        if ('speechSynthesis' in window) {
            // Stop any ongoing speech
            window.speechSynthesis.cancel();

            // Replace "x" with "times" for proper pronunciation
            const modifiedText = text.replace(/ x /g, ' times ');

            const utterance = new SpeechSynthesisUtterance(modifiedText);
            utterance.lang = 'en-US'; // Set the language
            utterance.rate = 1.5; // Increase the speaking rate (1.5 is faster than normal)
            utterance.pitch = 1; // Normal pitch
            window.speechSynthesis.speak(utterance);

        } else {
            console.error("Speech Synthesis API is not supported in this browser.");
        }
    }

    function speakSlow(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US'; // Set the language
            utterance.rate = 0.8; // Set the speaking rate (1 is normal)
            window.speechSynthesis.speak(utterance);
        } else {
            console.error("Speech Synthesis API is not supported in this browser.");
        }
    }

    function startTimer() {
        const timerElement = document.getElementById("timer");
        const hiddenTimerInput = document.getElementById("timeRemainingInput");

        const interval = setInterval(async function () {
            if (timeRemaining <= 0) {
                clearInterval(interval);
                speakSlow("Time is up. Submit your score.");
                alert("Time is up! Submit your score.");
                speakSlow("Please check your score.");

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
                        window.location.href = `/quiz-results?score=${result.score}&totalQuestions=${totalQuestionsAsked}`;
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

    async function submitAnswer() {
        const answerInput = document.getElementById("answerInput");
        const timeRemainingInput = document.getElementById("timeRemainingInput");
        const questionText = document.getElementById("questionText");
        const scoreText = document.getElementById("scoreText");

        const data = {
            answer: answerInput.value.trim(), // Get user input (trimmed)
            timeRemaining: timeRemainingInput.value // Include time remaining
        };

        try {
            const response = await fetch('/submit-answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.end) {
                // Redirect to results page if the quiz has ended
                window.location.href = `/quiz-results?score=${result.score}&totalQuestions=${totalQuestionsAsked}`;
            } else {
                // Update the question and score
                questionText.textContent = result.question;

                console.log("Audio enabled ", audioEnabled > 0)

                if (audioEnabled > 0) {
                    // Speak the new question
                    speak(result.question);
                }

                totalQuestionsAsked++;
                scoreText.textContent = `${result.score} / ${totalQuestionsAsked}`;
                answerInput.value = ""; // Clear the input for the next question
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        const submitAnswerButton = document.getElementById('submitAnswer');

        if (submitAnswerButton) {
            submitAnswerButton.addEventListener('click', function () {
                document.getElementById('answerInput').focus();
            });
        }
    });

    // Show the modal on page load
    window.onload = function () {
        const questionText = document.getElementById("questionText").textContent;
        console.log('Question Text', questionText)

        const modal = document.getElementById('modal');
        const backdrop = document.getElementById('backdrop');
        const enableAudioButton = document.getElementById('enableAudioButton');
        const closeModalButton = document.getElementById('closeModalButton');
        const noButton = document.getElementById('noButton');

        if (modal) {
            modal.style.display = 'block';
        }

        // Trigger speech and close modal when user clicks "Enable Audio"
        enableAudioButton.addEventListener('click', function () {
            speak(questionText);
            audioEnabled++;
            console.log("Audio score ", audioEnabled)
            modal.style.display = 'none';
            document.getElementById('answerInput').focus();
            startTimer(); // Start the timer when the page loads
        });

        // Close modal when the "No" button is clicked
        noButton.addEventListener('click', function () {
            modal.style.display = 'none';
            document.getElementById('answerInput').focus();
            startTimer(); // Start the timer when the page loads
        });

        // Close modal when the "X" button is clicked
        closeModalButton.addEventListener('click', function () {
            modal.style.display = 'none';
            document.getElementById('answerInput').focus();
            startTimer(); // Start the timer when the page loads
        });

    };