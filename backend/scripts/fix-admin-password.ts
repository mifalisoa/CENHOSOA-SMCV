// backend/scripts/fixAdminPassword.ts

import bcrypt from 'bcrypt';
import { pool } from '../src/config/database';

async function fixAdminPassword() {
    try {
        const password = 'Admin@2025';
        const email    = 'admin@cenhosoa.mg';

        // Récupérer le hash actuel — table utilisateurs, colonne mot_de_passe, email
        const result = await pool.query(
            'SELECT mot_de_passe FROM utilisateurs WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            console.log('❌ Utilisateur admin non trouvé');
            await pool.end();
            process.exit(1);
        }

        const storedHash = result.rows[0].mot_de_passe;

        console.log('🔐 Test du mot de passe actuel...');
        const isValid = await bcrypt.compare(password, storedHash);

        if (isValid) {
            console.log('✅ Le mot de passe fonctionne déjà !');
            console.log('  Email:', email);
            console.log('  Mot de passe: Admin@2025');
        } else {
            console.log('❌ Le mot de passe ne correspond pas');
            console.log('🔧 Génération d\'un nouveau hash...');

            const newHash = await bcrypt.hash(password, 10);

            await pool.query(
                'UPDATE utilisateurs SET mot_de_passe = $1 WHERE email = $2',
                [newHash, email]
            );

            console.log('✅ Mot de passe mis à jour !');
            console.log('  Email:', email);
            console.log('  Mot de passe: Admin@2025');
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

fixAdminPassword();