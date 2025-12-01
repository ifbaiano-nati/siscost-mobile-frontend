import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';

interface Profile {
  id: number;
  name: string;
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    profile: '',
  });

  const { register } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      const data = await api.getProfiles();
      setProfiles(data);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar perfis');
    } finally {
      setLoadingProfiles(false);
    }
  }

  const validateEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const handleRegister = async () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      profile: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Nome não pode ser vazio';
    } else if (name.length < 5) {
      newErrors.name = 'Nome é muito curto';
    }

    if (!email || !validateEmail(email)) {
      newErrors.email = 'Favor inserir um e-mail válido';
    }

    if (!password) {
      newErrors.password = 'Senha não pode ser vazia';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    } else if (password !== confirmPassword) {
      newErrors.password = 'As senhas não coincidem';
    }

    if (!selectedProfile) {
      newErrors.profile = 'Selecione um perfil de usuário';
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== '')) {
      return;
    }

    try {
      setLoading(true);
      await register({
        name,
        email,
        password,
        confirmPassword,
        profile_id: selectedProfile!,
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorData = error.response.data?.errors;
        if (errorData?.email) {
          setErrors({ ...errors, email: 'Este email já está em uso' });
        } else {
          Alert.alert('Erro', 'Erro no registro. Verifique os detalhes e tente novamente.');
        }
      } else {
        Alert.alert('Erro', error.message || 'Erro ao registrar');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            contentFit="contain"
            transition={200}
          />
          <Text style={styles.title}>Cadastro</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo:</Text>
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Seu nome completo"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail:</Text>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Seu melhor e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Perfil de usuário:</Text>
            {errors.profile ? <Text style={styles.errorText}>{errors.profile}</Text> : null}
            <View style={[styles.pickerContainer, errors.profile && styles.inputError]}>
              <Picker
                selectedValue={selectedProfile}
                onValueChange={(value) => setSelectedProfile(value)}
                enabled={!loading && !loadingProfiles}
              >
                <Picker.Item label="Selecione um perfil" value={null} />
                {profiles.map((profile) => (
                  <Picker.Item
                    key={profile.id}
                    label={profile.name}
                    value={profile.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha:</Text>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar senha:</Text>
            <TextInput
              style={styles.input}
              placeholder="Repita a senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkText}>Já possui um cadastro? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#1976d2',
    fontSize: 14,
  },
});

