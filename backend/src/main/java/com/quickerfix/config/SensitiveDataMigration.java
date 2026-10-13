package com.quickerfix.config;

import com.quickerfix.security.SensitiveDataCipher;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/** Encrypts legacy plaintext private fields in bounded batches during startup. */
@Component
@RequiredArgsConstructor
public class SensitiveDataMigration implements CommandLineRunner {
    private static final int BATCH_SIZE = 250;
    private final JdbcTemplate jdbc;
    private final SensitiveDataCipher cipher;

    @Override
    public void run(String... args) {
        int users = encryptColumn("users", "phone");
        int messages = encryptColumn("chat_messages", "content");
        if (users + messages > 0) {
            System.out.printf("Encrypted legacy private data: %d user phone values, %d chat messages%n", users, messages);
        }
    }

    private int encryptColumn(String table, String column) {
        String select = "select id, " + column + " from " + table + " where " + column
                + " is not null and " + column + " not like 'enc:v1:%' order by id limit " + BATCH_SIZE;
        int count = 0;
        while (true) {
            List<LegacyValue> rows = jdbc.query(select,
                    (rs, row) -> new LegacyValue(rs.getLong("id"), rs.getString(column)));
            if (rows.isEmpty()) return count;
            for (LegacyValue row : rows) {
                count += jdbc.update("update " + table + " set " + column + "=? where id=? and " + column + "=?",
                        cipher.encrypt(row.value()), row.id(), row.value());
            }
        }
    }

    private record LegacyValue(long id, String value) {}
}
