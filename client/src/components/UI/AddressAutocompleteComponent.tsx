import { TextField, Autocomplete, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { NominatimResult, Props } from "../../types/types";

const AddressAutocomplete = ({ value, setValue, onSelectLocation }: Props) => {
  const [options, setOptions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value.length < 3) {
      setOptions([]);
      return;
    }

    const controller = new AbortController();
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}`,
          {
            signal: controller.signal,
            headers: {
              "Accept-Language": "de",
            },
          }
        );
        const data = await response.json();
        setOptions(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Adresssuche fehlgeschlagen:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(fetchAddresses, 400);

    return () => {
      controller.abort();
      clearTimeout(delayDebounceFn);
    };
  }, [value]);

  return (
    <Autocomplete
      freeSolo
      options={options.map((option) => option.display_name)}
      loading={loading}
      inputValue={value}
      onInputChange={(_, newInputValue) => setValue(newInputValue)}
      onChange={(_, selectedDisplayName) => {
        const selected = options.find(
          (o) => o.display_name === selectedDisplayName
        );
        if (selected) {
          onSelectLocation({
            lat: parseFloat(selected.lat),
            lon: parseFloat(selected.lon),
          });
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Adresse suchen"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default AddressAutocomplete;
