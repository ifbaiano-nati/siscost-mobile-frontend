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
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';

interface Profile {
  id: number;
  name: string;
}

const PRIMARY_COLOR = '#1976d2';
const ALERT_COLOR = '#d32f2f';
const NEUTRAL_LIGHT = '#f0f0f0';

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
      if (data.length === 1 && !selectedProfile) {
        setSelectedProfile(data[0].id);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar perfis. Tente novamente mais tarde.');
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

    if (!name.trim()) { newErrors.name = 'Nome não pode ser vazio'; }
    else if (name.length < 5) { newErrors.name = 'Nome é muito curto'; }
    if (!email || !validateEmail(email)) { newErrors.email = 'Favor inserir um e-mail válido'; }
    if (!password) { newErrors.password = 'Senha não pode ser vazia'; }
    else if (password.length < 6) { newErrors.password = 'A senha deve ter pelo menos 6 caracteres'; }
    else if (password !== confirmPassword) { newErrors.password = 'As senhas não coincidem'; }
    if (!selectedProfile) { newErrors.profile = 'Selecione um perfil de usuário'; }

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
          Alert.alert('Erro', 'Erro no registro. Verifique os detalhes.');
        }
      } else {
        Alert.alert('Erro', error.message || 'Erro ao registrar');
      }
    } finally {
      setLoading(false);
    }
  };

  const isInputValid = (field: keyof typeof errors) => errors[field] === '';


  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // 🚨 MUDANÇA: Fundo branco/neutro 🚨
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER COM LOGO E MENSAGEM */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/logoCompleta.png')}
              style={styles.logo}
              contentFit="contain"
              transition={200}
            />
            <Text style={styles.title}>Junte-se à rede SISCOST</Text>
          </View>

          {/* CARD DO FORMULÁRIO */}
          <View style={styles.formCard}>
            <View style={styles.form}>

              {/* NOME COMPLETO */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome completo</Text>
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                <View style={[styles.inputWrapper, errors.name && styles.inputWrapperError, isInputValid('name') && name.length > 0 && styles.inputWrapperSuccess]}>
                  <Icon name="account-outline" size={20} color={errors.name ? ALERT_COLOR : PRIMARY_COLOR} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Seu nome completo"
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* E-MAIL */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError, isInputValid('email') && email.length > 0 && styles.inputWrapperSuccess]}>
                  <Icon name="email-outline" size={20} color={errors.email ? ALERT_COLOR : PRIMARY_COLOR} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* PERFIL DE USUÁRIO (PICKER) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Perfil de usuário</Text>
                {errors.profile ? <Text style={styles.errorText}>{errors.profile}</Text> : null}
                <View style={[styles.inputWrapper, styles.pickerInput, errors.profile && styles.inputWrapperError]}>
                  <Icon name="account-group-outline" size={20} color={errors.profile ? ALERT_COLOR : PRIMARY_COLOR} style={[styles.inputIcon, {marginLeft: 10}]} />
                  {loadingProfiles ? (
                    <ActivityIndicator color={PRIMARY_COLOR} size="small" />
                  ) : (
                    <Picker
                      selectedValue={selectedProfile}
                      onValueChange={(value) => setSelectedProfile(value)}
                      enabled={!loading}
                      style={styles.pickerStyle}
                      itemStyle={styles.pickerItemStyle}
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
                  )}
                </View>
              </View>

              {/* SENHA */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError, isInputValid('password') && password.length > 0 && styles.inputWrapperSuccess]}>
                  <Icon name="lock-outline" size={20} color={errors.password ? ALERT_COLOR : PRIMARY_COLOR} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Sua senha (mínimo 6 caracteres)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
              </View>

              {/* CONFIRMAR SENHA */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar senha</Text>
                <View style={[styles.inputWrapper, password !== confirmPassword && confirmPassword.length > 0 && styles.inputWrapperError]}>
                  <Icon name="lock-check-outline" size={20} color={password !== confirmPassword && confirmPassword.length > 0 ? ALERT_COLOR : PRIMARY_COLOR} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
                {(password !== confirmPassword && confirmPassword.length > 0) && (
                  <Text style={styles.errorText}>As senhas não coincidem</Text>
                )}
              </View>

              {/* BOTÃO DE REGISTRO */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>REGISTRAR</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* VOLTAR PARA LOGIN */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkText}>Já possui um cadastro? <Text style={{ fontWeight: '700' }}>Fazer Login</Text></Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🚨 MUDANÇA: Fundo branco no topo e na área do formulário
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: NEUTRAL_LIGHT, // Fundo cinza claro para o corpo da tela
  },
  scrollContent: {
    flexGrow: 1,
    padding: 25,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '90%',
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Card Branco para o Formulário
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  // Input Style Otimizado
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: NEUTRAL_LIGHT,
  },
  inputWrapperError: {
    borderColor: ALERT_COLOR,
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
  },
  inputWrapperSuccess: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: 'rgba(25, 118, 210, 0.05)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#000',
    paddingVertical: 12,
    fontSize: 16,
  },
  // PICKER STYLE OTIMIZADO
  pickerInput: {
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: NEUTRAL_LIGHT,
    backgroundColor: NEUTRAL_LIGHT,
  },
  pickerStyle: {
    flex: 1,
    height: 48,
    color: '#333',
  },
  pickerItemStyle: {
    fontSize: 16,
  },
  // ------------------------------------
  errorText: {
    color: ALERT_COLOR,
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
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
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
});