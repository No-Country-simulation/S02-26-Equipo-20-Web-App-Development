package com.nocountry.backend.validations;

import java.lang.annotation.*;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Constraint(validatedBy = VectorTimesValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidVectorTimes {
    String message() default "vectorTimes tiene un formato inválido o segmento con tiempo invertido (inicio >= fin)";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}