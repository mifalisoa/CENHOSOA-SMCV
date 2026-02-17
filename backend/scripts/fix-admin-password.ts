import bcrypt from 'bcrypt';
import { pool } from '../src/config/database';

async function fixAdminPassword() {
    try {
        const password = 'Admin@2025';
        const email = 'admin@cenhosoa.mg';
        
        // 1. Récupérer le hash actuel
        const result = await pool.query(
            'SELECT mdp_user FROM utilisateur WHERE email_user = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            console.log('❌ Utilisateur admin non trouvé');
            await pool.end();
            process.exit(1);
        }
        
        const storedHash = result.rows[0].mdp_user;
        
        console.log('🔐 Test du mot de passe actuel...');
        const isValid = await bcrypt.compare(password, storedHash);
        
        if (isValid) {
            console.log('✅ Le mot de passe fonctionne déjà !');
            console.log('');
            console.log('Vous pouvez vous connecter avec :');
            console.log('  Email: admin@cenhosoa.mg');
            console.log('  Mot de passe: Admin@2025');
        } else {
            console.log('❌ Le mot de passe ne correspond pas');
            console.log('🔧 Génération d\'un nouveau hash...');
            
            const newHash = await bcrypt.hash(password, 10);
            
            await pool.query(
                'UPDATE utilisateur SET mdp_user = $1 WHERE email_user = $2',
                [newHash, email]
            );
            
            console.log('✅ Mot de passe mis à jour !');
            console.log('');
            console.log('Nouveau hash:', newHash);
            console.log('');
            console.log('Vous pouvez maintenant vous connecter avec :');
            console.log('  Email: admin@cenhosoa.mg');
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