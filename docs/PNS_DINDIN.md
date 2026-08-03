# PNS `.dindin` no Meu Dinheiro

O aplicativo resolve nomes públicos como `carlosdelfino.dindin` pelo contrato global `DindinNameRegistry` na Polygon. `.dindin` é namespace próprio da plataforma, não DNS e não ENS oficial.

O cadastro usa a Smart Account como destino, normalização canônica e commit–reveal. Antes do compromisso/reveal, o app mostra nome, Smart Account e taxa efetiva. Cada etapa exige biometria, PIN ou padrão. O segredo de reveal fica no SecureStore e é removido após o recibo.

Transferências por nome sempre exibem o nome digitado e o endereço resolvido na revisão. O app nunca confia em resolução de outra chain, não permite endereço zero e mantém a agenda vinculada ao endereço canônico.

Taxas são definidas no dashboard por proposta global ou regional, aprovadas por multisig/timelock. O dashboard e a relay não controlam unilateralmente o registro.

> Antes da produção, o registro deve ser incluído na política do Paymaster global para preservar custo de gas zero. O fluxo direto atual é somente de homologação e não deve ser publicado para usuários finais.
