package com.quickerfix.service;

import com.quickerfix.entity.Category;
import com.quickerfix.enums.Severity;
import org.springframework.stereotype.Component;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

/** Small explainable multinomial Naive Bayes classifier trained from curated civic examples. */
@Component
public class LocalTriageProvider implements TriageProvider {
    private static final Pattern PRIVATE_DATA = Pattern.compile("(?i)\\b[\\w.+-]+@[\\w.-]+\\.[a-z]{2,}\\b|\\b(?:\\+?\\d[\\s().-]?){8,15}\\b|\\b\\d{12}\\b");
    private static final Map<String, List<String>> EXAMPLES = Map.of(
        "road", List.of("pothole broken asphalt street road", "cracked road damaged pavement", "traffic signal road", "bridge sidewalk road infrastructure"),
        "light", List.of("streetlight lamp not working", "dark street lighting pole", "electricity power outage", "wire cable sparking electric hazard"),
        "garbage", List.of("garbage waste rubbish not collected", "dump litter trash accumulation", "dirty sanitation waste"),
        "water", List.of("water pipe leaking burst supply", "no water supply tap", "drain overflowing sewage", "water contamination"),
        "tree", List.of("fallen tree branch", "park garden environment tree", "playground public space damaged"),
        "infrastructure", List.of("public infrastructure damaged bridge sidewalk", "broken public facility road")
    );

    @Override public Result classify(String title, String description, List<Category> categories) {
        String text = tokens(sanitize((title == null ? "" : title) + " " + (description == null ? "" : description)));
        Map<Long, Double> scores = new LinkedHashMap<>();
        for (Category category : categories) {
            String label = (category.getName() + " " + (category.getDepartment() == null ? "" : category.getDepartment().getName())).toLowerCase(Locale.ROOT);
            String group = label.contains("pothole") || label.contains("road") ? "road" : label.contains("streetlight") || label.contains("light") || label.contains("electrical") ? "light" : label.contains("garbage") || label.contains("sanitation") || label.contains("waste") ? "garbage" : label.contains("water") || label.contains("sewage") ? "water" : label.contains("tree") || label.contains("park") || label.contains("environment") ? "tree" : "infrastructure";
            List<String> examples = EXAMPLES.get(group);
            Map<String, Integer> counts = new HashMap<>(); int total = 0;
            for (String example : examples) for (String token : example.split(" ")) { counts.merge(token, 1, Integer::sum); total++; }
            double score = Math.log(1.0 / categories.size());
            for (String token : text.split(" ")) if (!token.isBlank()) score += Math.log((counts.getOrDefault(token, 0) + 1.0) / (total + 100.0));
            scores.put(category.getId(), score);
        }
        List<Map.Entry<Long, Double>> ranked = scores.entrySet().stream().sorted(Map.Entry.<Long, Double>comparingByValue().reversed()).toList();
        Category selected = categories.stream().filter(c -> ranked.get(0).getKey().equals(c.getId())).findFirst().orElse(categories.get(0));
        double max = ranked.get(0).getValue(); double sum = ranked.stream().mapToDouble(e -> Math.exp(e.getValue() - max)).sum();
        double confidence = Math.exp(max - max) / sum;
        Severity severity = severity(text);
        boolean matched = Arrays.stream(text.split(" ")).anyMatch(t -> t.length() > 3 && EXAMPLES.values().stream().flatMap(List::stream).anyMatch(e -> Arrays.asList(e.split(" ")).contains(t)));
        String rationale = matched ? "Local Naive Bayes ranked " + selected.getName() + " highest from the issue vocabulary: " + explainWords(text, selected.getName()) : "No strong category vocabulary match; administrator review is required.";
        List<RankedCategory> alternatives = ranked.stream().skip(1).limit(4).map(e -> {
            double probability = Math.exp(e.getValue() - max) / sum;
            Category category = categories.stream().filter(c -> c.getId().equals(e.getKey())).findFirst().orElseThrow();
            return new RankedCategory(category.getId(), category.getName(), probability);
        }).toList();
        return new Result(selected.getId(), confidence, rationale, "LOCAL_NAIVE_BAYES", severity, alternatives);
    }
    private static Severity severity(String text) {
        if (List.of("collapse", "electrocution", "fire", "explosion", "flood", "life threatening", "severe injury").stream().anyMatch(text::contains)) return Severity.CRITICAL;
        if (List.of("dangerous", "sparking", "burst", "overflow", "blocked", "injury", "urgent").stream().anyMatch(text::contains)) return Severity.HIGH;
        if (List.of("minor", "small", "cosmetic").stream().anyMatch(text::contains)) return Severity.LOW;
        return Severity.MEDIUM;
    }
    private static String sanitize(String text) { return PRIVATE_DATA.matcher(text).replaceAll(" "); }
    private static String tokens(String text) { return Normalizer.normalize(text.toLowerCase(Locale.ROOT), Normalizer.Form.NFD).replaceAll("\\p{M}", "").replaceAll("[^a-z ]", " ").replaceAll("\\s+", " ").trim(); }
    private static String explainWords(String text, String category) { return Arrays.stream(text.split(" ")).filter(t -> !t.isBlank()).distinct().limit(6).reduce((a,b) -> a + ", " + b).orElse(category); }
}
