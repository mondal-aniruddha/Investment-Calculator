package com.infinance.networth.service;
import com.infinance.config_engine.service.AssumptionService;
import com.infinance.networth.dto.*;
import com.infinance.networth.engine.NetWorthEngine;
import org.springframework.stereotype.Service;
import java.util.Map;
@Service public class NetWorthService {
    private final AssumptionService assumptions;
    public NetWorthService(AssumptionService assumptions) { this.assumptions = assumptions; }
    public NetWorthResponse calculate(NetWorthRequest r) {
        var x = NetWorthEngine.calculate(r);
        return new NetWorthResponse(x.totalAssets(), x.totalLiabilities(), x.netWorth(), x.allocation(), x.history(),
                assumptions.buildBaseAssumptions(null, Map.of("tool", "NET_WORTH_TRACKER", "persistence", "CLIENT_SUPPLIED_SNAPSHOTS")));
    }
}
