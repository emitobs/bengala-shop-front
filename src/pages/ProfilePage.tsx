import { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Edit2, Trash2, MapPin, Plus, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format-date';
import {
  useProfile,
  useUpdateProfile,
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useChangePassword,
} from '@/hooks/useUsers';
import type { Address } from '@/api/users.api';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ComboboxInput from '@/components/ui/ComboboxInput';
import Modal from '@/components/ui/Modal';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { URUGUAY_DEPARTMENTS, URUGUAY_CITIES } from '@/shared/constants';

const DEPARTMENTS = URUGUAY_DEPARTMENTS.map((d) => ({ value: d, label: d }));

type TabKey = 'personal' | 'addresses' | 'security';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'personal', label: 'Datos personales' },
  { key: 'addresses', label: 'Direcciones' },
  { key: 'security', label: 'Seguridad' },
];

const EMPTY_ADDRESS_FORM = {
  label: 'Casa',
  recipientName: '',
  street: '',
  number: '',
  apartment: '',
  city: '',
  department: '',
  postalCode: '',
  phone: '',
  isDefault: false,
};

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
      <aside>
        <Card>
          <CardBody className="flex flex-col items-center text-center">
            <Skeleton variant="circle" className="h-24 w-24 mb-4" />
            <Skeleton variant="text" className="h-6 w-40 mb-2" />
            <Skeleton variant="text" className="h-4 w-48 mb-1" />
            <Skeleton variant="text" className="h-3 w-36 mt-2" />
            <Skeleton variant="rect" className="h-9 w-32 mt-5" />
          </CardBody>
        </Card>
      </aside>
      <main>
        <div className="flex border-b border-border mb-6">
          <Skeleton variant="rect" className="h-10 w-40 mr-4" />
          <Skeleton variant="rect" className="h-10 w-32 mr-4" />
          <Skeleton variant="rect" className="h-10 w-28" />
        </div>
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Skeleton variant="rect" className="h-16" />
              <Skeleton variant="rect" className="h-16" />
              <Skeleton variant="rect" className="h-16" />
              <Skeleton variant="rect" className="h-16" />
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  const { data: user, isLoading: isLoadingProfile, isError: isProfileError } = useProfile();
  const { data: addresses = [], isLoading: isLoadingAddresses } = useAddresses();
  const updateProfile = useUpdateProfile();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const changePassword = useChangePassword();

  const [activeTab, setActiveTab] = useState<TabKey>('personal');

  // Personal info form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Address state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);

  // Delete confirmation state
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  // Security form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync form fields when profile data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone ?? '');
    }
  }, [user]);

  if (isLoadingProfile) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Mi Cuenta' },
          ]}
          className="mb-6"
        />
        <ProfileSkeleton />
      </div>
    );
  }

  if (isProfileError || !user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Mi Cuenta' },
          ]}
          className="mb-6"
        />
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-500">
              No se pudo cargar la informacion del perfil. Intenta de nuevo mas tarde.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;

  const handleSavePersonal = () => {
    updateProfile.mutate({ firstName, lastName, phone: phone || undefined });
  };

  const handleOpenAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        label: address.label,
        recipientName: address.recipientName,
        street: address.street,
        number: address.number,
        apartment: address.apartment ?? '',
        city: address.city,
        department: address.department,
        postalCode: address.postalCode,
        phone: address.phone ?? '',
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setAddressForm(EMPTY_ADDRESS_FORM);
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = () => {
    const payload = {
      label: addressForm.label,
      recipientName: addressForm.recipientName,
      street: addressForm.street,
      number: addressForm.number,
      apartment: addressForm.apartment || undefined,
      city: addressForm.city,
      department: addressForm.department,
      postalCode: addressForm.postalCode,
      phone: addressForm.phone || undefined,
      isDefault: addressForm.isDefault,
    };

    if (editingAddress) {
      updateAddress.mutate(
        { id: editingAddress.id, data: payload },
        { onSuccess: () => setIsAddressModalOpen(false) },
      );
    } else {
      createAddress.mutate(payload, {
        onSuccess: () => setIsAddressModalOpen(false),
      });
    }
  };

  const handleDeleteAddress = (id: string) => {
    setDeletingAddressId(id);
  };

  const confirmDeleteAddress = () => {
    if (deletingAddressId) {
      deleteAddress.mutate(deletingAddressId, {
        onSuccess: () => setDeletingAddressId(null),
      });
    }
  };

  const handleChangePassword = () => {
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      },
    );
  };

  const isSavingAddress = createAddress.isPending || updateAddress.isPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Mi Cuenta' },
        ]}
        className="mb-6"
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
        {/* LEFT SIDEBAR */}
        <aside>
          <Card>
            <CardBody className="flex flex-col items-center text-center">
              <Avatar
                src={user.avatarUrl}
                name={fullName}
                size="lg"
                className="h-24 w-24 text-2xl mb-4"
              />
              <h2 className="text-xl font-bold text-secondary">{fullName}</h2>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Miembro desde {formatDate(user.createdAt)}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => setActiveTab('personal')}
              >
                <Edit2 className="h-4 w-4" />
                Editar perfil
              </Button>
            </CardBody>
          </Card>
        </aside>

        {/* RIGHT MAIN AREA */}
        <main>
          {/* Tabs */}
          <div className="flex border-b border-border mb-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-secondary hover:border-gray-300',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Personal Info */}
          {activeTab === 'personal' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-secondary">
                    Datos personales
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    label="Nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                  <Input
                    label="Apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Tu apellido"
                  />
                  <Input
                    label="Email"
                    value={user.email}
                    disabled
                    type="email"
                  />
                  <Input
                    label="Telefono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="099 123 456"
                    type="tel"
                  />
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <Button
                    onClick={handleSavePersonal}
                    isLoading={updateProfile.isPending}
                    disabled={updateProfile.isPending}
                  >
                    Guardar cambios
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Tab: Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary">
                  Mis direcciones
                </h3>
                <Button
                  size="sm"
                  onClick={() => handleOpenAddressModal()}
                >
                  <Plus className="h-4 w-4" />
                  Agregar direccion
                </Button>
              </div>

              {isLoadingAddresses ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardBody>
                        <div className="flex items-start gap-3">
                          <Skeleton variant="circle" className="h-5 w-5 mt-0.5" />
                          <div className="flex-1 space-y-2">
                            <Skeleton variant="text" className="h-5 w-3/4" />
                            <Skeleton variant="text" className="h-4 w-1/2" />
                            <Skeleton variant="text" className="h-4 w-1/3" />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <Card>
                  <CardBody className="text-center py-12">
                    <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No tenes direcciones guardadas
                    </p>
                  </CardBody>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <Card key={address.id}>
                      <CardBody>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-secondary">
                                {address.street} {address.number}
                              </p>
                              {address.apartment && (
                                <p className="text-sm text-gray-500">
                                  {address.apartment}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                {address.city}, {address.department}
                              </p>
                              <p className="text-sm text-gray-400">
                                CP {address.postalCode}
                              </p>
                              {address.recipientName && (
                                <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                  <User className="h-3 w-3" />
                                  {address.recipientName}
                                </p>
                              )}
                              {address.phone && (
                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {address.phone}
                                </p>
                              )}
                              {address.isDefault && (
                                <Badge variant="success" className="mt-2">
                                  Predeterminada
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleOpenAddressModal(address)}
                              className="rounded-full p-2 text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
                              aria-label="Editar direccion"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="rounded-full p-2 text-gray-400 hover:text-error hover:bg-red-50 transition-colors"
                              aria-label="Eliminar direccion"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}

              {/* Address Modal */}
              <Modal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                title={
                  editingAddress ? 'Editar direccion' : 'Nueva direccion'
                }
                size="lg"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Nombre del destinatario"
                    value={addressForm.recipientName}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, recipientName: e.target.value }))
                    }
                    placeholder="Juan Perez"
                  />
                  <Input
                    label="Etiqueta"
                    value={addressForm.label}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, label: e.target.value }))
                    }
                    placeholder="Casa, Oficina..."
                  />
                  <Input
                    label="Calle"
                    value={addressForm.street}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, street: e.target.value }))
                    }
                    placeholder="Av. 18 de Julio"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Numero"
                      value={addressForm.number}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          number: e.target.value,
                        }))
                      }
                      placeholder="1234"
                    />
                    <Input
                      label="Apto/Oficina"
                      value={addressForm.apartment}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          apartment: e.target.value,
                        }))
                      }
                      placeholder="Apto 302"
                    />
                  </div>
                  <Select
                    label="Departamento"
                    value={addressForm.department}
                    onChange={(e) => {
                      const dept = e.target.value;
                      setAddressForm((f) => {
                        const cities = URUGUAY_CITIES[dept] ?? [];
                        const cityValid = cities.includes(f.city);
                        return {
                          ...f,
                          department: dept,
                          city: cityValid ? f.city : '',
                        };
                      });
                    }}
                    options={DEPARTMENTS}
                    placeholder="Selecciona un departamento"
                  />
                  <ComboboxInput
                    label="Ciudad"
                    value={addressForm.city}
                    onChange={(value) =>
                      setAddressForm((f) => ({ ...f, city: value }))
                    }
                    suggestions={URUGUAY_CITIES[addressForm.department] ?? []}
                    placeholder="Escribe para buscar..."
                  />
                  <Input
                    label="Codigo postal"
                    value={addressForm.postalCode}
                    onChange={(e) =>
                      setAddressForm((f) => ({
                        ...f,
                        postalCode: e.target.value,
                      }))
                    }
                    placeholder="11100"
                  />
                  <Input
                    label="Telefono de contacto"
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm((f) => ({
                        ...f,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="099 123 456"
                    type="tel"
                  />
                  <div className="flex items-center gap-2 self-end pb-1 sm:col-span-2">
                    <input
                      type="checkbox"
                      id="is-default"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          isDefault: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="is-default"
                      className="text-sm text-secondary"
                    >
                      Usar como direccion predeterminada
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setIsAddressModalOpen(false)}
                    disabled={isSavingAddress}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveAddress}
                    isLoading={isSavingAddress}
                    disabled={isSavingAddress}
                  >
                    Guardar
                  </Button>
                </div>
              </Modal>

              {/* Delete Confirmation Dialog */}
              <ConfirmDialog
                isOpen={!!deletingAddressId}
                onClose={() => setDeletingAddressId(null)}
                onConfirm={confirmDeleteAddress}
                title="Eliminar direccion"
                message="Estas seguro de que queres eliminar esta direccion? Esta accion no se puede deshacer."
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                variant="danger"
                isLoading={deleteAddress.isPending}
              />
            </div>
          )}

          {/* Tab: Security */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-secondary">
                    Cambiar contraseña
                  </h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="max-w-md space-y-5">
                  <Input
                    label="Contraseña actual"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <Input
                    label="Nueva contraseña"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                  />
                  <Input
                    label="Confirmar nueva contraseña"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    error={
                      confirmPassword && confirmPassword !== newPassword
                        ? 'Las contraseñas no coinciden'
                        : undefined
                    }
                  />
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <Button
                    onClick={handleChangePassword}
                    disabled={
                      !currentPassword ||
                      !newPassword ||
                      newPassword !== confirmPassword ||
                      changePassword.isPending
                    }
                    isLoading={changePassword.isPending}
                  >
                    Cambiar contraseña
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
