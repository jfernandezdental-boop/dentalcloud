import { validateDocument as v, formatMoney, getCountry } from './countries';
let fail = 0;
const t = (name: string, got: boolean, exp: boolean) => { if (got !== exp) { fail++; console.log('FALLA', name); } };
const ok = (c: string, ty: string, n: string) => v(c, ty, n).ok;
// válidos conocidos
t('EC cédula 1710034065', ok('EC','CEDULA','1710034065'), true);
t('CL RUT 12.345.678-5', ok('CL','RUT','12.345.678-5'), true);
t('ES DNI 12345678Z', ok('ES','DNI','12345678Z'), true);
t('ES NIE X1234567L', ok('ES','NIE','X1234567L'), true);
t('BR CPF 111.444.777-35', ok('BR','CPF','111.444.777-35'), true);
t('BR CNPJ 11.222.333/0001-81', ok('BR','CNPJ','11.222.333/0001-81'), true);
t('AR CUIT 20-12345678-6', ok('AR','CUIT','20-12345678-6'), true);
t('PE RUC 20100070970', ok('PE','RUC','20100070970'), true);
t('UY CI 1.234.567-2', ok('UY','CI','1.234.567-2'), true);
t('CO NIT 899.999.063-3', ok('CO','NIT','899.999.063-3'), true);
t('MX CURP HEGG560427MVZRRL04', ok('MX','CURP','HEGG560427MVZRRL04'), true);
// inválidos: dígito verificador alterado
t('EC cédula mala', ok('EC','CEDULA','1710034066'), false);
t('CL RUT malo', ok('CL','RUT','12.345.678-4'), false);
t('ES DNI letra mala', ok('ES','DNI','12345678A'), false);
t('BR CPF malo', ok('BR','CPF','111.444.777-36'), false);
t('BR CPF repetido', ok('BR','CPF','111.111.111-11'), false);
t('AR CUIT malo', ok('AR','CUIT','20-12345678-5'), false);
t('PE RUC malo', ok('PE','RUC','20100070971'), false);
t('UY CI mala', ok('UY','CI','1.234.567-3'), false);
t('CO NIT malo', ok('CO','NIT','899.999.063-4'), false);
t('MX CURP mala', ok('MX','CURP','HEGG560427MVZRRL05'), false);
t('EC provincia 99', ok('EC','CEDULA','9910034065'), false);
t('tipo inexistente', ok('EC','RUT','1'), false);
// RUC EC: se arma un RUC de sociedad privada con su dígito calculado y debe validar
const base = '179001691'; const w = [4,3,2,7,6,5,4,3,2];
const r = [...base].reduce((s,c,i)=>s+Number(c)*w[i],0)%11; const dv = r===0?0:11-r;
if (dv !== 10) t('EC RUC privado generado', ok('EC','RUC', base+dv+'001'), true);
t('EC RUC natural', ok('EC','RUC','1710034065001'), true);
// moneda
console.log(formatMoney(1234.5,'EC'), '|', formatMoney(1234.5,'CL'), '|', formatMoney(1234.5,'ES'), '|', formatMoney(1234.5,'BR'), '|', formatMoney(1234.5,'MX'), '|', formatMoney(null,'XX'), '|', getCountry('pe').name);
console.log(fail ? `${fail} fallas` : 'todas las pruebas pasan');
