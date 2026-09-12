//编写程序输入一个4行4列的整型数组，
//求出这个数组中的“马鞍点”。
//马鞍点是指这个元素在所处的行上最小，列上最大。
//请输出这个马鞍点的位置及马鞍点的值。
//如果没有马鞍点，则输出没找到马鞍点



#include <stdio.h>
int main() {
    int a[4][4];
    int i,j,k;
    // 输入4行4列的整型数组元素
    for(i=0;i<4;i++){
        for(j=0;j<4;j++){
            scanf("%d",&a[i][j]);
        }
    }
    int found=0;  // 标记是否找到马鞍点，初始化为0表示未找到。 
    for(i=0;i<4;i++) {
        // 先找出当前行的最小值及其所在列索引
        int min=a[i][0];
        int minindex=0;
        for(j=1;j<4;j++){
            if(a[i][j]< min){
                min=a[i][j];
                minindex=j;
            }
        }

        // 再判断该最小值在其所在列上是否为最大值
        int maxindex=1;  // 先假设它是列上最大值，标记为1
        for(k=0;k<4;k++){
            if (a[k][minindex]>min){
                maxindex=0;  // 如果发现有更大的值，标记为0，表示不是列上最大值
                break;
            }
        }
        if(maxindex){
            found=1;
            printf("马鞍点位置：第%d行 第%d列，值为：%d\n", i+1,minindex+1,min);
            break;  // 找到一个马鞍点后就可以结束查找了
        }
    }

    if (!found) {
        printf("没找到马鞍点\n");
    }
    return 0;
}
