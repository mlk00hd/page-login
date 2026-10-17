-- À exécuter dans la base Aiven (par défaut : defaultdb) via MySQL Workbench.
-- DONNÉES FICTIVES UNIQUEMENT.
SELECT * FROM users;
CREATE TABLE IF NOT EXISTS users (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  contact    VARCHAR(254) NOT NULL,
  username   VARCHAR(50)  NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_contact (contact),
  UNIQUE KEY uq_users_contact_username (contact, username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS login_attempts (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  contact      VARCHAR(254) NOT NULL,
  username     VARCHAR(50)  NOT NULL,
  success      TINYINT(1)   NOT NULL,
  attempted_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_attempts_date (attempted_at),
  KEY idx_attempts_success (success, attempted_at),
  KEY idx_attempts_contact (contact)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO users (contact, username) VALUES
  ('etudiant1@gmail.com', 'etudiant1'),
  ('etudiant2@gmail.com', 'etudiant2'),
  ('+213550000001',       'demo_telephone');
