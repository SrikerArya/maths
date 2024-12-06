package com.example.multiplicationapp.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Random;

@Controller
public class QuizController {

    // Random generator for generating questions
    private Random random = new Random();

    @GetMapping("/start-quiz")
    public String startQuiz(HttpSession session, Model model,
                            @RequestParam(name = "level", required = false, defaultValue = "1") int level,
                            @RequestParam(name = "timer", required = false, defaultValue = "1") int timer) {
        int timeInSeconds = timer * 60;
        session.setAttribute("level", level);
        session.setAttribute("timer", timeInSeconds); // Store timer in session
        session.setAttribute("score", 0);

        // Initialize score and timer only if not already set
        if (session.getAttribute("score") == null) {
            session.setAttribute("score", 0);
        }
        if (session.getAttribute("timer") == null) {
            session.setAttribute("timer", 60);
        }

        // Generate a question dynamically based on the level
        String question = generateQuestion(level);
        session.setAttribute("question", question);

        // Pass attributes to the model
        model.addAttribute("level", level);
        model.addAttribute("timer", timeInSeconds);

        model.addAttribute("score", 0);
//        model.addAttribute("timeRemaining", session.getAttribute("timer"));
        model.addAttribute("question", question);

        return "quiz";
    }

    @PostMapping("/submit-answer")
    @ResponseBody
    public ResponseEntity<?> submitAnswer(
            @RequestBody Map<String, String> requestBody,
            HttpSession session) {

        // Extract request parameters
        String answerParam = requestBody.get("answer");
        String timeRemainingParam = requestBody.get("timeRemaining");

        // Retrieve session attributes
        Integer level = (Integer) session.getAttribute("level");
        Integer score = (Integer) session.getAttribute("score");
        String question = (String) session.getAttribute("question");

        if (level == null || score == null || question == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid session"));
        }

        // Validate and parse timeRemaining
        int timeRemaining = (timeRemainingParam != null && !timeRemainingParam.isEmpty())
                ? Integer.parseInt(timeRemainingParam)
                : 0;

        if (timeRemaining <= 0) {
            return ResponseEntity.ok(Map.of("end", true, "score", score));
        }

        // Validate and parse the user's answer
        int userAnswer = 0;
        if (answerParam != null && !answerParam.isEmpty()) {
            try {
                userAnswer = Integer.parseInt(answerParam);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid answer format!"));
            }
        }

        // Parse the question and calculate the correct answer
        String[] questionParts = question.split(" x ");
        int correctAnswer = Integer.parseInt(questionParts[0]) * Integer.parseInt(questionParts[1]);

        // Check the answer and update the score
        if (userAnswer == correctAnswer) {
            score++;
        }
        session.setAttribute("score", score);

        // Generate the next question
        String newQuestion = generateQuestion(level);
        session.setAttribute("question", newQuestion);

        // Return updated question and score
        return ResponseEntity.ok(Map.of(
                "question", newQuestion,
                "score", score,
                "timeRemaining", timeRemaining
        ));
    }

//    // Generate a random question based on the level
//    private String generateQuestion(int level) {
//        int num1 = random.nextInt(level == 1 ? 10 : (level == 2 ? 12 : 20)) + 1;
//        int num2 = random.nextInt(level == 1 ? 10 : (level == 2 ? 12 : 20)) + 1;
//        return num1 + " x " + num2;
//    }

    // Generate a random question based on the level
    private String generateQuestion(int level) {
        int num1 = random.nextInt(level == 1 ? 5 :
                (level == 2 ? 10 :
                        (level == 3 ? 12 :
                                (level == 4 ? 15 : 20)))) + 1;
        int num2 = random.nextInt(level == 1 ? 5 :
                (level == 2 ? 10 :
                        (level == 3 ? 12 :
                                (level == 4 ? 15 : 20)))) + 1;
        return num1 + " x " + num2;
    }

}