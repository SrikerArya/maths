package com.example.multiplicationapp.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ResultController {

    @GetMapping("/quiz-results")
    public String quizResults(HttpSession session, Model model, @RequestParam int totalQuestions) {
        Integer score = (Integer) session.getAttribute("score");
        model.addAttribute("score", score != null ? score : 0);
        model.addAttribute("totalQuestions", totalQuestions );
        return "quiz-results";
    }

}
