-- Enough rows to develop against before auth exists.
--
-- There is no sign-in yet, so the API acts as one fixed local account. When
-- Sign in with Apple lands (spec section 8), this account becomes just another
-- row and the hardcoded id in internal/playthrough goes away.

BEGIN;

INSERT INTO account (id, handle, email, display_name, bio)
VALUES (1, 'peterg', 'dev@localhost', 'Peter G',
        'Long RPGs, short roguelikes, no patience for tutorials.')
ON CONFLICT (id) DO NOTHING;

-- Keep the sequence ahead of the explicit id above.
SELECT setval('account_id_seq', GREATEST((SELECT MAX(id) FROM account), 1));

INSERT INTO platform (name, abbreviation, family) VALUES
    ('PlayStation 5', 'PS5', 'PlayStation'),
    ('Xbox Series X|S', 'Xbox', 'Xbox'),
    ('Nintendo Switch', 'Switch', 'Nintendo'),
    ('PC', 'PC', 'PC'),
    ('Steam Deck', 'Deck', 'PC')
ON CONFLICT DO NOTHING;

COMMIT;
