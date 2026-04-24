export const isStrongPassword = (password: string): boolean => {
    const strongRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return strongRegex.test(password);
};
